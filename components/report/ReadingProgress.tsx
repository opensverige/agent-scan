// components/report/ReadingProgress.tsx
//
// Pure CSS scroll-progress bar via animation-timeline.
// Zero JS, zero reflows, zero scroll-handlers.
// Falls back to no animation in browsers without scroll-driven CSS
// (Safari < 17). That fallback is acceptable — the page is still readable.

export function ReadingProgress() {
  return <div className="report-scroll-progress" aria-hidden />;
}
