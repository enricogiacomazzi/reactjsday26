import { CanvasNode } from './hostConfig.js'

// Wraps every host config method so you can watch the reconciler talk to the host.
// Open the demo with ?log to enable it.

const QUIET = new Set([
  'getCurrentUpdatePriority', 'setCurrentUpdatePriority', 'resolveUpdatePriority',
  'scheduleTimeout', 'cancelTimeout', 'scheduleMicrotask', 'trackSchedulerEvent',
  'resolveEventType', 'resolveEventTimeStamp', 'shouldAttemptEagerTransition',
  'getPublicInstance', 'requestPostPaintCallback', 'maySuspendCommit',
  'maySuspendCommitOnUpdate', 'maySuspendCommitInSyncRender', 'shouldSetTextContent',
])

function describe(arg) {
  if (arg instanceof CanvasNode) return `<${arg.type}>`
  if (arg && arg.type === '#text') return JSON.stringify(arg.text)
  if (arg && arg.ctx) return 'container'
  if (typeof arg === 'string') return `'${arg}'`
  return null // props, fibers, contexts: too noisy to print
}

export function withLogging(config, log) {
  const wrapped = {}
  for (const [key, value] of Object.entries(config)) {
    if (typeof value !== 'function' || QUIET.has(key)) {
      wrapped[key] = value
      continue
    }
    wrapped[key] = (...args) => {
      const shown = args.map(describe).filter(Boolean).slice(0, 3)
      log(`${key}(${shown.join(', ')})`)
      return value(...args)
    }
  }
  return wrapped
}
