// The "A for Acre" mark — a mountain peak over a horizon and a road/field fan,
// framed in a rounded square. Recreated from the brand style guide as a single
// currentColor SVG so it can sit on light backgrounds (header) or dark ones
// (footer) just by changing text color, rather than shipping separate assets.
export function BrandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="8" y="8" width="84" height="84" rx="14" stroke="currentColor" strokeWidth="4" />
      <path d="M50 22 L24 58 M50 22 L76 58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="18" y1="58" x2="82" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 58 L50 84 M50 58 L32 84 M50 58 L68 84" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
