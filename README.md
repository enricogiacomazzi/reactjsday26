# react-canvas-mini

The demo renderer from the talk **“React and the Multiverse of Render”**: a custom React renderer that draws to a 2D `<canvas>`, built on `react-reconciler`.

```bash
npm install
npm run dev
```

Open `http://localhost:5173/?log` to see every host config call next to the canvas.

## Elements

| Element | Props |
|---|---|
| `<group>` | `x`, `y`, `opacity`, `onClick` |
| `<rect>` | `x`, `y`, `w`, `h`, `radius`, `fill`, `stroke`, `lineWidth`, `opacity`, `onClick` (can have children) |
| `<circle>` | `x`, `y`, `r`, `fill`, `opacity`, `onClick` |
| `<label>` | `x`, `y`, `size`, `weight`, `font`, `fill`, `align`. Text is only allowed inside `<label>` |

Children are positioned relative to their parent. Clicks bubble from the topmost hit shape up to the root.

## Where each slide lives

| Slide step | File |
|---|---|
| 1 · Host instance (`CanvasNode`) | `src/renderer/hostConfig.js` |
| 2–5 · Creation, mutation, updates | `src/renderer/hostConfig.js` |
| 6 · One paint per commit | `src/renderer/paint.js` |
| 7 · Host context (`inLabel`) | `src/renderer/hostConfig.js` |
| 8 · Priorities + React 19 stubs | `src/renderer/hostConfig.js`, `src/renderer/events.js` |
| 9 · Reconciler + root | `src/renderer/index.js` |
| Events (hit-testing) | `src/renderer/events.js` |
| Host config logging | `src/renderer/logger.js` |
| Demo app | `src/App.jsx` |

## Versions

Pinned to `react@19.3.1` and `react-reconciler@0.34.0`. The host config contract changes between releases. In 0.34:

- `createContainer` takes `onDefaultTransitionIndicator` as its last argument.
- `injectIntoDevTools()` takes no arguments. The renderer name and version come from `rendererPackageName` and `rendererVersion` in the host config.
