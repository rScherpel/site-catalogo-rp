import type { AdminAccessRankingItem } from '../../types/admin'

interface TopAccessListProps {
  items: AdminAccessRankingItem[]
}

export function TopAccessList({ items }: TopAccessListProps) {
  return (
    <div className="admin-panel">
      <div className="admin-panel__header">
        <h3>Mais acessados no mês</h3>
      </div>

      {items.length === 0 ? (
        <p className="admin-muted">Sem acessos registrados no mês atual.</p>
      ) : (
        <ol className="admin-ranking">
          {items.map((item) => (
            <li key={item.establishmentId} className="admin-ranking__item">
              <div>
                <strong>{item.establishmentName}</strong>
                <span>{item.categoryLabel}</span>
              </div>
              <span className="admin-ranking__count">{item.accessCount}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
