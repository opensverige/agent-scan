// lib/visibility/safe-fetch.ts
//
// Fetch for user-supplied domains. The domain regex rejects IP literals, but
// a hostname can still resolve to 127.0.0.1, 10.x or 169.254.169.254, and a
// public site can redirect to an internal URL. Page text flows into the
// model and back to the requester, so an internal response could be read
// out. This wrapper:
//   - resolves every hop's hostname and refuses private/loopback/link-local
//   - follows at most 3 redirects manually, re-checking each hop
//   - only allows http/https on default ports
//   - streams the body and stops at a byte cap

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const MAX_REDIRECTS = 3;

function isPrivateV4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some(n => Number.isNaN(n))) return true;
  const [a, b] = p;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateV6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::" || v === "::1") return true;
  if (v.startsWith("fe80") || v.startsWith("fc") || v.startsWith("fd")) return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateV4(mapped[1]);
  return false;
}

/** True when the address must not be fetched. Exported for tests. */
export function isBlockedAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPrivateV4(ip);
  if (kind === 6) return isPrivateV6(ip);
  return true;
}

async function hostIsPublic(hostname: string): Promise<boolean> {
  if (isIP(hostname)) return !isBlockedAddress(hostname);
  try {
    const addrs = await lookup(hostname, { all: true });
    return addrs.length > 0 && addrs.every(a => !isBlockedAddress(a.address));
  } catch {
    return false;
  }
}

function allowedUrl(url: URL): boolean {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  if (url.port && url.port !== "80" && url.port !== "443") return false;
  if (url.username || url.password) return false;
  return true;
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    total += value.byteLength;
  }
  await reader.cancel().catch(() => undefined);
  const buf = new Uint8Array(Math.min(total, maxBytes));
  let offset = 0;
  for (const c of chunks) {
    const slice = c.subarray(0, Math.min(c.byteLength, buf.byteLength - offset));
    buf.set(slice, offset);
    offset += slice.byteLength;
    if (offset >= buf.byteLength) break;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(buf);
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
      if (!allowedUrl(url) || !(await hostIsPublic(url.hostname))) return null;
      const res = await fetch(url, { headers: init.headers, redirect: "manual", signal });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        await res.body?.cancel().catch(() => undefined);
        url = new URL(res.headers.get("location") as string, url);
        continue;
      }
      const body = init.readBody ? await readCapped(res, init.maxBytes) : "";
      if (!init.readBody) await res.body?.cancel().catch(() => undefined);
      return { status: res.status, body, headers: res.headers, url: url.toString() };
    }
    return null;
  } catch {
    return null;
  }
}
