import { createContext } from 'react'
import { DefaultEventPriority, NoEventPriority } from 'react-reconciler/constants'
import { schedulePaint } from './paint.js'

// ─── Step 1 · What is a host instance? ────────────────────────────────────────
// Canvas has no tree of its own, so we invent a tiny scene graph.
export class CanvasNode {
  constructor(type, props) {
    this.type = type // 'group' | 'rect' | 'circle' | 'label'
    this.props = props
    this.children = []
    this.parent = null
    this.hidden = false // used by Suspense (hideInstance / unhideInstance)
  }
}

const createText = (text) => ({ type: '#text', text, parent: null, hidden: false })

const ELEMENTS = new Set(['group', 'rect', 'circle', 'label'])

// ─── Tree helpers (the container has the same `children` shape as a node) ────
function detach(child) {
  const parent = child.parent
  if (!parent) return
  const i = parent.children.indexOf(child)
  if (i !== -1) parent.children.splice(i, 1)
  child.parent = null
}

// ─── Step 4 · Mutation methods (commit phase) ────────────────────────────────
function appendChild(parent, child) {
  detach(child) // React also uses appendChild to MOVE existing nodes
  parent.children.push(child)
  child.parent = parent
}

function insertBefore(parent, child, before) {
  detach(child)
  const i = parent.children.indexOf(before)
  parent.children.splice(i, 0, child)
  child.parent = parent
}

function removeChild(parent, child) {
  detach(child)
}

// ─── Step 8 · Priorities ──────────────────────────────────────────────────────
let currentUpdatePriority = NoEventPriority

export function runWithPriority(priority, fn) {
  const previous = currentUpdatePriority
  currentUpdatePriority = priority
  try {
    return fn()
  } finally {
    currentUpdatePriority = previous
  }
}

export const hostConfig = {
  // ─── Modes ──────────────────────────────────────────────────────────────────
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: true, // set false when running next to React DOM on one page

  // Used by React DevTools (react-reconciler >= 0.33 reads them from here)
  rendererPackageName: 'react-canvas-mini',
  rendererVersion: '0.1.0',

  // ─── Step 2 · Creation (render phase: no side effects!) ─────────────────────
  createInstance(type, props, rootContainer, hostContext, fiber) {
    if (!ELEMENTS.has(type)) {
      throw new Error(`<${type}> is not a canvas element`)
    }
    return new CanvasNode(type, props)
  },

  createTextInstance(text, rootContainer, hostContext, fiber) {
    if (!hostContext.inLabel) {
      throw new Error(`Text "${text}" must be inside <label>`)
    }
    return createText(text)
  },

  // ─── Step 3 · Assemble the detached tree (render phase) ─────────────────────
  appendInitialChild(parent, child) {
    parent.children.push(child)
    child.parent = parent
  },

  finalizeInitialChildren(instance, type, props, rootContainer, hostContext) {
    return false // true → commitMount() runs once attached
  },

  shouldSetTextContent(type, props) {
    return false // every string child becomes a text instance
  },

  getPublicInstance(instance) {
    return instance // what ref.current points to
  },

  // ─── Step 7 · Host context ──────────────────────────────────────────────────
  getRootHostContext(container) {
    return { inLabel: false }
  },

  getChildHostContext(parent, type, container) {
    const inLabel = type === 'label'
    // same object back = nothing changed = no extra work
    return inLabel === parent.inLabel ? parent : { inLabel }
  },

  // ─── Step 4 · Mutations (commit phase) ──────────────────────────────────────
  appendChild,
  insertBefore,
  removeChild,
  appendChildToContainer: appendChild,
  insertInContainerBefore: insertBefore,
  removeChildFromContainer: removeChild,

  clearContainer(container) {
    container.children.forEach((child) => (child.parent = null))
    container.children.length = 0
  },

  // ─── Step 5 · Updates (React 19: no prepareUpdate, you diff here) ───────────
  commitUpdate(node, type, oldProps, newProps, fiber) {
    node.props = newProps // immediate-mode host: we repaint everything anyway
  },

  commitTextUpdate(textNode, oldText, newText) {
    textNode.text = newText
  },

  resetTextContent() {},
  commitMount() {},

  // Suspense: what does "hidden" mean for our host? We just skip painting it.
  hideInstance(node) { node.hidden = true },
  unhideInstance(node) { node.hidden = false },
  hideTextInstance(textNode) { textNode.hidden = true },
  unhideTextInstance(textNode) { textNode.hidden = false },

  // ─── Step 6 · Commit lifecycle ──────────────────────────────────────────────
  prepareForCommit(container) {
    return null // React DOM saves focus and selection here
  },

  resetAfterCommit(container) {
    container.commits += 1
    schedulePaint(container) // one paint per frame, however many commits
  },

  preparePortalMount() {},
  detachDeletedInstance() {},

  // ─── Step 8 · Scheduling & priorities ───────────────────────────────────────
  setCurrentUpdatePriority(priority) {
    currentUpdatePriority = priority
  },
  getCurrentUpdatePriority: () => currentUpdatePriority,
  resolveUpdatePriority: () => currentUpdatePriority || DefaultEventPriority,

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  supportsMicrotasks: true,
  scheduleMicrotask: queueMicrotask,

  // ─── Stubs React 19 expects even if we don't use the features ───────────────
  NotPendingTransition: null,
  HostTransitionContext: createContext(null),
  resetFormInstance() {},
  requestPostPaintCallback() {},
  shouldAttemptEagerTransition: () => false,
  trackSchedulerEvent() {},
  resolveEventType: () => null,
  resolveEventTimeStamp: () => -1.1,
  maySuspendCommit: () => false,
  maySuspendCommitOnUpdate: () => false,
  maySuspendCommitInSyncRender: () => false,
  preloadInstance: () => true,
  startSuspendingCommit() {},
  suspendInstance() {},
  waitForCommitToBeReady: () => null,
  getInstanceFromNode: () => null,
  beforeActiveInstanceBlur() {},
  afterActiveInstanceBlur() {},
  prepareScopeUpdate() {},
  getInstanceFromScope: () => null,
}
