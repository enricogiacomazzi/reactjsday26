import { useEffect, useState } from 'react'
import { COLORS } from "../colors";

function Satellite({t, phase = 0}) {
  return (
      <circle
        x={Math.cos(t / 30 + phase) * 140}
        y={Math.sin(t / 30 + phase) * 140}
        r={24}
        fill={COLORS.pink}
      />
  )
}

export function Orbit({ paused }) {
  const [t, setT] = useState(0);

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setT((t) => t + 1), 16)
    return () => clearInterval(id)
  }, [paused])

  return (
    <group x={240} y={240}>
      <circle r={36} fill={COLORS.cyan} />
      <Satellite t={t} />
      {/* two text instances: "Frame " and the number */}
      <label x={0} y={168} align="center" size={22} fill="#B8B1D9">
        Frame {t}
      </label>
    </group>
  )
}