interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="admin-empty admin-empty--error">
      <h3>Não foi possível carregar</h3>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="admin-button admin-button--primary" onClick={onRetry}>
          Tentar novamente
        </button>
      ) : null}
    </section>
  )
}
