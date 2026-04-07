interface LoadingStateProps {
  cardsCount?: number
}

export function LoadingState({ cardsCount = 4 }: LoadingStateProps) {
  return (
    <div className="catalog-grid catalog-grid--skeleton" aria-busy="true" aria-live="polite">
      {Array.from({ length: cardsCount }, (_, index) => (
        <article key={index} className="establishment-card establishment-card--skeleton">
          <div className="establishment-card__top">
            <div className="skeleton skeleton--logo" />
            <div className="establishment-card__head">
              <div className="skeleton skeleton--title" />
              <div className="establishment-card__badges">
                <span className="skeleton skeleton--badge" />
                <span className="skeleton skeleton--badge" />
              </div>
            </div>
          </div>

          <div className="establishment-card__details">
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line" />
          </div>

          <div className="establishment-card__actions">
            <div className="skeleton skeleton--button" />
            <div className="skeleton skeleton--button" />
            <div className="skeleton skeleton--button skeleton--button-full" />
          </div>
        </article>
      ))}
    </div>
  )
}
