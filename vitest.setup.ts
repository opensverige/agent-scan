import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement HTMLMediaElement.play()/pause() — return resolved
// promises so React components with autoplay <video> don't crash on mount.
if (typeof window !== "undefined" && window.HTMLMediaElement) {
  window.HTMLMediaElement.prototype.play = () => Promise.resolve();
  window.HTMLMediaElement.prototype.pause = () => {};
}
