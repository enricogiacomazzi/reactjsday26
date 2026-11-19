import { useState } from 'react'
import { Bars } from './components/Bars';
import { Button } from './components/Button';
import { Orbit } from './components/Orbit';
import { COLORS } from './colors';




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
