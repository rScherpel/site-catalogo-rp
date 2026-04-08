import type { AdminAccessRankingItem } from '../../types/admin'

interface AccessRankingTableProps {
  items: AdminAccessRankingItem[]
}

export function AccessRankingTable({ items }: AccessRankingTableProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Posição</th>
            <th>Estabelecimento</th>
            <th>Categoria</th>
            <th>Acessos</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.establishmentId}>
              <td>#{index + 1}</td>
              <td>{item.establishmentName}</td>
              <td>{item.categoryLabel}</td>
              <td>{item.accessCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
