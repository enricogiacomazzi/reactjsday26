import { createRoot, onHostCall } from './renderer/index.js'
import { App } from './App.jsx'

// Optional: show host config calls on the page (open with ?log)
const logEl = document.getElementById('log')
if (new URLSearchParams(location.search).has('log')) {
  const lines = []
  let queued = false
  logEl.hidden = false
  onHostCall((line) => {
    lines.push(line)
    if (lines.length > 40) lines.shift()
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      logEl.textContent = lines.join('\n')
    })
  })
}

createRoot(document.getElementById('stage')).render(<App />)
