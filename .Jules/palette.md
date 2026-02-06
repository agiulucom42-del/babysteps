## 2026-02-02 - [Tailwind Safelist for Dynamic Themes]
**Learning:** In projects using Tailwind via CDN or a custom runtime configuration (like AI Studio apps), dynamic class construction (e.g., `bg-${themeColor}-500`) requires an explicit safelist in `index.html`. If new variants like `focus-visible` or `group-hover` are needed, they must be added to the safelist's `variants` array, otherwise they will be ignored by the compiler.
**Action:** Always check `index.html` for a Tailwind `safelist` when adding new interaction states or dynamic colors to ensure they are rendered correctly.
