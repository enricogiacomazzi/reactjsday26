import { COLORS } from "../colors";

export function Bars({ order }) {
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