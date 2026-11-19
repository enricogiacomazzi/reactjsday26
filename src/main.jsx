import { createRoot } from './renderer/index.js'
import { App } from './App.jsx'


createRoot(document.getElementById('stage')).render(<App />)
