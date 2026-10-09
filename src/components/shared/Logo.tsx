/** Brand marks drawn for Realty OS (no logo asset was supplied). */

export function RoofMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 19.5 10.2 4.5h3.6l7.7 15h-4.6L12 9.9 7.1 19.5z" fill="currentColor" />
      <path d="M14.9 19.5l1.9-3.7 1.9 3.7z" fill="currentColor" />
    </svg>
  )
}

export function StripeMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 30 21" aria-hidden="true">
      <path d="M6 1h17l-3.5 4.6H2.5z" fill="#FD4A36" />
      <path d="M9.5 8.2h17L23 12.8H6z" fill="#FD4A36" />
      <path d="M6 15.4h17L19.5 20H2.5z" fill="#FD4A36" />
    </svg>
  )
}
