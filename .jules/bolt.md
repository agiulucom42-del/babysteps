# Bolt's Performance Journal ⚡

## 2025-05-14 - [Initial Assessment]
**Learning:** The application uses a central state in `App.tsx`, which can cause cascading re-renders. While some memoization exists, `GrowthView.tsx` is missing `React.memo` and performs expensive data transformations on every render.
**Action:** Implement `React.memo` and `useMemo` in `GrowthView.tsx` to optimize data processing and prevent unnecessary re-renders.

## 2025-05-14 - [Helper Function Scoping]
**Learning:** Pure utility functions like `getMonthsBetween` defined inside a component are recreated on every render. While the overhead is small, it's a "cold path" optimization that's easy to implement and improves code cleanliness.
**Action:** Move pure utility functions outside of the React component definition to avoid redundant re-creations and improve performance.
