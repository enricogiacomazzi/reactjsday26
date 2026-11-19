// ─── Step 6 · Painting: an immediate-mode host repaints the whole frame ──────

// Called from resetAfterCommit: coalesce many commits into one paint per frame.
export function schedulePaint(container) {
  if (container.frame) return
  container.frame = requestAnimationFrame(() => {
    container.frame = 0
    paint(container)
  })
}

export function paint(container) {
  const { ctx, width, height, dpr } = container
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = container.background
  ctx.fillRect(0, 0, width, height)
  container.children.forEach((node) => drawNode(ctx, node))
}

// Text is fragmented: <label>Frame {t}</label> holds two text instances.
export const labelText = (node) =>
  node.children
    .filter((child) => child.type === '#text' && !child.hidden)
    .map((child) => child.text)
    .join('')

function drawNode(ctx, node) {
  if (node.hidden || node.type === '#text') return
  const p = node.props

  ctx.save()
  ctx.globalAlpha *= p.opacity ?? 1
  ctx.translate(p.x ?? 0, p.y ?? 0) // children are positioned relative to parents

  switch (node.type) {
    case 'rect':
      ctx.beginPath()
      ctx.roundRect(0, 0, p.w ?? 0, p.h ?? 0, p.radius ?? 0)
      ctx.fillStyle = p.fill ?? '#F2EFFA'
      ctx.fill()
      if (p.stroke) {
        ctx.lineWidth = p.lineWidth ?? 2
        ctx.strokeStyle = p.stroke
        ctx.stroke()
      }
      break

    case 'circle':
      ctx.beginPath()
      ctx.arc(0, 0, p.r ?? 10, 0, Math.PI * 2)
      ctx.fillStyle = p.fill ?? '#F2EFFA'
      ctx.fill()
      break

    case 'label':
      ctx.font = `${p.weight ?? 500} ${p.size ?? 20}px ${p.font ?? 'system-ui, sans-serif'}`
      ctx.fillStyle = p.fill ?? '#F2EFFA'
      ctx.textAlign = p.align ?? 'left'
      ctx.textBaseline = 'top'
      ctx.fillText(labelText(node), 0, 0)
      break
  }

  if (node.type !== 'label') node.children.forEach((child) => drawNode(ctx, child))
  ctx.restore()
}
