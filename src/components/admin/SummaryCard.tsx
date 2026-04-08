interface SummaryCardProps {
  label: string
  value: string | number
  tone?: 'brand' | 'accent' | 'success' | 'warning'
}

export function SummaryCard({ label, value, tone = 'brand' }: SummaryCardProps) {
  return (
    <article className={`admin-summary-card admin-summary-card--${tone}`}>
      <span className="admin-summary-card__label">{label}</span>
      <strong className="admin-summary-card__value">{value}</strong>
    </article>
  )
}
