interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'neutral' | 'error'
}

export function EmptyState({ title, description, actionLabel, onAction, tone = 'neutral' }: EmptyStateProps) {
  return (
    <section className={tone === 'error' ? 'state-card state-card--error' : 'state-card'} aria-live="polite">
      <div className="state-card__icon" aria-hidden="true">
        {tone === 'error' ? '!' : '↗'}
      </div>
      <h2 className="state-card__title">{title}</h2>
      <p className="state-card__description">{description}</p>

      {actionLabel && onAction ? (
        <button type="button" className="action-button action-button--primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  )
}
