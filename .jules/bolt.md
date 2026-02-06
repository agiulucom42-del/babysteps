## 2026-02-01 - [Hoisting and Memoization in GrowthView]
**Learning:** Found an O(N * M log M) bottleneck where Object.keys and sort were called on every record in every render. Also discovered an in-place mutation bug where milestones.sort() was called directly in JSX.
**Action:** Always hoist constant derivations (like WHO standard keys) out of loops and components. Use useMemo for derived data like sorted arrays to prevent redundant work and accidental state mutation.
