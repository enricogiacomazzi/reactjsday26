import Reconciler from 'react-reconciler'
import { ConcurrentRoot } from 'react-reconciler/constants'
import { hostConfig } from './hostConfig.js'
import { withLogging } from './logger.js'
import { attachEvents } from './events.js'

// ─── Step 9 · Wire it up: reconciler + root ──────────────────────────────────

let log = null
export function onHostCall(listener) {
  log = listener
}

const logging = new URLSearchParams(location.search).has('log')
const config = logging ? withLogging(hostConfig, (line) => log?.(line)) : hostConfig

const reconciler = Reconciler(config)

// React DevTools picks the renderer up (name/version come from the host config)
reconciler.injectIntoDevTools()

export function createRoot(canvas, { width = 960, height = 540, background = '#0F0C1D' } = {}) {
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.aspectRatio = `${width} / ${height}`

  const container = {
    ctx: canvas.getContext('2d'),
    children: [],
    frame: 0,
    commits: 0,
    width,
    height,
    dpr,
    background,
  }

  // react-reconciler 0.34 (React 19.3) signature — it changes between versions!
  const root = reconciler.createContainer(
    container,
    ConcurrentRoot, // createRoot semantics: transitions, Suspense, batching
    null, // hydration callbacks
    false, // isStrictMode
    null, // concurrentUpdatesByDefaultOverride (ignored)
    '', // identifierPrefix for useId
    reconciler.defaultOnUncaughtError,
    reconciler.defaultOnCaughtError,
    reconciler.defaultOnRecoverableError,
    () => {}, // onDefaultTransitionIndicator
  )

  const detachEvents = attachEvents(canvas, container)

  return {
    container,
    render(element) {
      reconciler.updateContainer(element, root, null, null)
    },
    unmount() {
      reconciler.updateContainer(null, root, null, null)
      detachEvents()
    },
  }
}
