export function LoadingState({ label = 'Carregando admin...' }: { label?: string }) {
  return <div className="admin-state admin-state--loading">{label}</div>
}
