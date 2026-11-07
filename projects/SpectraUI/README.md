# Spectra UI

An interactive, high-density component laboratory with real WCAG 2.x contrast calculations. It is **not** an independently certified design system.

## Implemented
- Foreground and background token editor with color pickers and working WCAG contrast/AA/AAA normal/large text checks.
- Black-or-white foreground suggestion based on measured contrast.
- Roving-tabindex ARIA tab navigation (Left, Right, Home, End).
- Native modal dialog, polite live status region, details/summary disclosures.
- Sortable accessible table using native buttons and aria-sort.
- Responsive styles, visible focus and reduced motion.

## Links
- Demo: https://karma-spectra-ui.vercel.app/
- Source: web/index.html, web/app.mjs and web/contrast.mjs.
- Test: node --test tests/spectra.test.mjs

## Not yet implemented
- Published npm package and TypeScript API.
- Independent WCAG AAA certification, automated axe + manual screen-reader audits.
- Browser-measured CLS and frame-time budgets across devices.

No enterprise security certification or zero-layout-shift claims are made.
