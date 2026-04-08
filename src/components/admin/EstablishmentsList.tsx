import { Link } from 'react-router-dom'
import type { AdminEstablishmentListItem } from '../../types/admin'

interface EstablishmentsListProps {
  items: AdminEstablishmentListItem[]
}

export function EstablishmentsList({ items }: EstablishmentsListProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>ID</th>
            <th>Categoria</th>
            <th>Ativo</th>
            <th>Patrocinado</th>
            <th>Telefone</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <Link className="admin-link" to={`/admin/establishments/${item.id}`}>
                  {item.name}
                </Link>
              </td>
              <td className="admin-mono">{item.id}</td>
              <td>{item.categoryLabel}</td>
              <td>{item.active ? 'Sim' : 'Não'}</td>
              <td>{item.sponsored ? 'Sim' : 'Não'}</td>
              <td>{item.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
