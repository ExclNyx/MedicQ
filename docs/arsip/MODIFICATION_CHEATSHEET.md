# MedicQ — Live Modification Cheat Sheet

## Change a color

Start with `src/constants/colors.ts` for the global MedicQ palette. Update the intended color in both `light` and `dark` if needed. A gradient can use `primaryLight`, `primary`, and `primaryDeep` at once.

## Change page spacing, text size or button shape

Open the relevant screen under `src/app/` or the shared component under `src/components/`. Find `StyleSheet.create()` or `style={{ ... }}`. For static styles prefer `StyleSheet.create()`. Keep `styles.someName` consistent between the definition and its use in JSX.

## Change a shared button/header/card

Look in `src/components/`. This can affect multiple screens, so check which pages import the component before changing behavior.

## Change queue behavior

- Staff button and page display: `src/app/(staff)/dashboard.tsx`
- Queue rules: `src/services/queue.service.ts`
- Queue Firestore reads/writes: `src/services/queue.repository.ts`

## CSS or StyleSheet?

For Android/iOS use React Native styles. `src/global.css` and `src/components/animated-icon.module.css` are web-only styles; do not use browser CSS to style native screens.
