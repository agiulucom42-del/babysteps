## 2026-01-31 - [Navigation Accessibility & Visual Cues]
**Learning:** For mobile-first React applications with dynamic themes, using Tailwind's safelist for interactive variants like `focus-visible` is essential when the classes are constructed dynamically (e.g., `focus-visible:ring-${themeColor}-400`). Without explicit safelisting of the variant, purged production builds will lose these accessibility features.
**Action:** Always verify that dynamic Tailwind variants (hover, focus, focus-visible) are covered by the project's safelist pattern in `index.html` or `tailwind.config.js`.
