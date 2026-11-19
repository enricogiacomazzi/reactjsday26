import { DiscreteEventPriority } from 'react-reconciler/constants'
import { runWithPriority } from './hostConfig.js'

// The reconciler ships no event system: onClick is just a prop on our node.
// We hit-test the scene graph ourselves and call the handlers.

function contains(node, x, y) {
  const p = node.props
  if (node.type === 'rect') return x >= 0 && y >= 0 && x <= (p.w ?? 0) && y <= (p.h ?? 0)
  if (node.type === 'circle') return x * x + y * y <= (p.r ?? 10) ** 2
  return false
}

// Walk children back to front (topmost first), in local coordinates.
function hitTest(nodes, x, y) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i]
    if (node.hidden || node.type === '#text') continue
    const lx = x - (node.props.x ?? 0)
    const ly = y - (node.props.y ?? 0)
    const inner = node.type !== 'label' && hitTest(node.children, lx, ly)
    if (inner) return inner
    if (contains(node, lx, ly)) return node
  }
  return null
}

// Bubble from the hit node up to the root, like the DOM.
function findHandler(container, x, y, name) {
  let node = hitTest(container.children, x, y)
  while (node && node !== container) {
    if (typeof node.props[name] === 'function') return node
    node = node.parent
  }
  return null
}

export function attachEvents(canvas, container) {
  const toLocal = (e) => {
    const r = canvas.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * container.width, ((e.clientY - r.top) / r.height) * container.height]
  }

  const onClick = (e) => {
    const [x, y] = toLocal(e)
    const target = findHandler(container, x, y, 'onClick')
    // A click is a discrete event: its updates win over background work.
    if (target) runWithPriority(DiscreteEventPriority, () => target.props.onClick({ x, y, target }))
  }

  const onMove = (e) => {
    const [x, y] = toLocal(e)
    canvas.style.cursor = findHandler(container, x, y, 'onClick') ? 'pointer' : 'default'
  }

  canvas.addEventListener('click', onClick)
  canvas.addEventListener('mousemove', onMove)
  return () => {
    canvas.removeEventListener('click', onClick)
    canvas.removeEventListener('mousemove', onMove)
  }
}
