

export function Button({ x, y, w = 170, children, onClick }) {
  return (
    <rect x={x} y={y} w={w} h={48} radius={12} fill="#1E1938" stroke="#2F2955" onClick={onClick}>
      <label x={w / 2} y={14} align="center" size={20} weight={600}>
        {children}
      </label>
    </rect>
  )
}