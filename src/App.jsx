import { useEffect, useState } from 'react'

const COLORS = { cyan: '#5ED3F3', pink: '#E879D0', gold: '#F2C46D', violet: '#8C85B3', mint: '#7EE0A1' }

// A "button" is just a component made of host elements. onClick is our own event system.
function Button({ x, y, w = 170, children, onClick }) {
  return (
    <rect x={x} y={y} w={w} h={48} radius={12} fill="#1E1938" stroke="#2F2955" onClick={onClick}>
      <label x={w / 2} y={14} align="center" size={20} weight={600}>
        {children}
      </label>
    </rect>
  )
}

// The slide demo: state + effects, unchanged from React DOM.
function Orbit({ paused }) {
  const [t, setT] = useState(0)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setT((t) => t + 1), 16)
    return () => clearInterval(id)
  }, [paused])

  return (
    <group x={240} y={240}>
      <circle r={36} fill={COLORS.cyan} />
      <circle
        x={Math.cos(t / 30) * 140}
        y={Math.sin(t / 30) * 140}
        r={24}
        fill={COLORS.pink}
        onClick={() => setT(0)}
      />
      {/* two text instances: "Frame " and the number */}
      <label x={0} y={168} align="center" size={22} fill="#B8B1D9">
        Frame {t}
      </label>
    </group>
  )
}

// Keyed reorders: React moves existing nodes with insertBefore / appendChild.
function Bars({ order }) {
  return (
    <group x={540} y={110}>
      <label size={18} fill="#8C85B3">
        keyed children
      </label>
      {order.map((key, i) => (
        <rect key={key} x={0} y={40 + i * 56} w={140 + key.length * 22} h={44} radius={10} fill={COLORS[key]}>
          <label x={16} y={12} size={20} weight={600} fill="#0F0C1D">
            {key}
          </label>
        </rect>
      ))}
    </group>
  )
}

const shuffle = (list) => [...list].sort(() => Math.random() - 0.5)

export function App() {
  const [paused, setPaused] = useState(false)
  const [order, setOrder] = useState(Object.keys(COLORS))

  return (
    <group>
      <label x={40} y={32} size={28} weight={700}>
        react-canvas-mini
      </label>
      <Orbit paused={paused} />
      <Bars order={order} />
      <Button x={40} y={460} onClick={() => setPaused((p) => !p)}>
        {paused ? 'Resume' : 'Pause'}
      </Button>
      <Button x={230} y={460} onClick={() => setOrder(shuffle)}>
        Shuffle
      </Button>
    </group>
  )
}
