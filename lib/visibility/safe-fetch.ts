// lib/visibility/safe-fetch.ts
//
// Fetch for user-supplied domains. The domain regex rejects IP literals, but
// a hostname can still resolve to 127.0.0.1, 10.x or 169.254.169.254, and a
// public site can redirect to an internal URL. Page text flows into the
// model and back to the requester, so an internal response could be read
// out. This wrapper:
//   - checks every resolved address inside the DNS lookup that opens the
//     socket, so a rebinding resolver cannot answer "public" to a pre-check
//     and "private" to the real connection
//   - follows at most 3 redirects manually, re-checking each hop
//   - only allows http/https on default ports, without credentials
//   - streams the (decompressed) body and stops at a byte cap
//
// It uses node:http(s) rather than fetch because fetch has no hook into the
// lookup that the connection actually uses.

import { lookup as dnsLookup, type LookupAddress, type LookupOptions } from "node:dns";
import * as http from "node:http";
import * as https from "node:https";
import { BlockList, isIP } from "node:net";
import type { Readable } from "node:stream";
import * as zlib from "node:zlib";

const MAX_REDIRECTS = 3;

const BLOCKED = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 3],
] as const) BLOCKED.addSubnet(net, prefix, "ipv4");
for (const [net, prefix] of [
  ["::", 96],          // unspecified, loopback, IPv4-compatible
  ["64:ff9b::", 96],   // NAT64, embeds an arbitrary IPv4 address
  ["64:ff9b:1::", 48], // local-use NAT64
  ["2001::", 32],      // Teredo
  ["2001:db8::", 32],  // documentation
  ["2002::", 16],      // 6to4, embeds an arbitrary IPv4 address
  ["fc00::", 7],       // unique local
  ["fe80::", 10],      // link-local
  ["ff00::", 8],       // multicast
] as const) BLOCKED.addSubnet(net, prefix, "ipv6");

/** True when the address must not be fetched. Exported for tests. */
export function isBlockedAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind !== 4 && kind !== 6) return true;
  try {
    // IPv4-mapped IPv6 (::ffff:127.0.0.1 and ::ffff:7f00:1) is matched
    // against the IPv4 rules by BlockList itself.
    return BLOCKED.check(ip, kind === 4 ? "ipv4" : "ipv6");
  } catch {
    return true;
  }
}

type LookupCallback = (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void;

/** DNS lookup that refuses non-public answers. Exported for tests. */
export function guardedLookup(hostname: string, options: LookupOptions, callback: LookupCallback): void {
  dnsLookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "");
    if (addresses.length === 0 || addresses.some(a => isBlockedAddress(a.address))) {
      const blocked: NodeJS.ErrnoException = new Error(`Refusing to connect to ${hostname}: non-public address`);
      blocked.code = "EBLOCKEDADDR";
      return callback(blocked, "");
    }
    if (options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
}

function allowedUrl(url: URL): boolean {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  if (url.username || url.password) return false;
  // Literal IPs never reach the lookup hook, so check them here.
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && isBlockedAddress(host)) return false;
  return true;
}

function request(url: URL, headers: Record<string, string>, signal: AbortSignal): Promise<http.IncomingMessage> {
  const mod = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = mod.request(url, {
      method: "GET",
      headers: { ...headers, "Accept-Encoding": "gzip, deflate, br" },
      lookup: guardedLookup,
      signal,
    }, resolve);
    req.on("error", reject);
    req.end();
  });
}

function decoded(res: http.IncomingMessage): Readable {
  const encoding = String(res.headers["content-encoding"] ?? "").trim().toLowerCase();
  if (encoding === "gzip" || encoding === "x-gzip") return res.pipe(zlib.createGunzip());
  if (encoding === "deflate") return res.pipe(zlib.createInflate());
  if (encoding === "br") return res.pipe(zlib.createBrotliDecompress());
  return res;
}

// The cap applies to decompressed bytes, so a small compressed bomb cannot
// expand past it.
async function readCapped(res: http.IncomingMessage, maxBytes: number): Promise<string> {
  const stream = decoded(res);
  const chunks: Buffer[] = [];
  let total = 0;
  try {
    for await (const chunk of stream) {
      const buf = chunk as Buffer;
      const room = maxBytes - total;
      chunks.push(buf.byteLength > room ? buf.subarray(0, room) : buf);
      total += Math.min(buf.byteLength, room);
      if (total >= maxBytes) break;
    }
  } finally {
    stream.destroy();
    res.destroy();
  }
  return Buffer.concat(chunks).toString("utf8");
}

function toHeaders(raw: http.IncomingHttpHeaders): Headers {
  const out = new Headers();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) for (const v of value) out.append(key, v);
    else if (typeof value === "string") out.set(key, value);
  }
  return out;
}

export interface SafeResponse {
  status: number;
  body: string;
  headers: Headers;
  url: string;
}

export async function safeFetch(
  input: string,
  init: { headers: Record<string, string>; timeoutMs: number; maxBytes: number; readBody: boolean },
): Promise<SafeResponse | null> {
  const signal = AbortSignal.timeout(init.timeoutMs);
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!allowedUrl(url)) return null;
      const res = await request(url, init.headers, signal);
      const status = res.statusCode ?? 0;
      const location = res.headers.location;
      if (status >= 300 && status < 400 && location) {
        res.destroy();
        url = new URL(location, url);
        continue;
      }
      const headers = toHeaders(res.headers);
      let body = "";
      if (init.readBody) body = await readCapped(res, init.maxBytes);
      else res.destroy();
      return { status, body, headers, url: url.toString() };
    }
    return null;
  } catch {
    return null;
  }
}
