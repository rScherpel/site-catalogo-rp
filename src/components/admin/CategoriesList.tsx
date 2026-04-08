import type { Category } from '../../types/catalog'

interface CategoriesListProps {
  categories: Category[]
  usageCountByCategoryId: Record<string, number>
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
}

export function CategoriesList({ categories, usageCountByCategoryId, onEdit, onDelete }: CategoriesListProps) {
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Slug</th>
            <th>Em uso</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const usageCount = usageCountByCategoryId[category.id] ?? 0

            return (
              <tr key={category.id}>
                <td>{category.label}</td>
                <td className="admin-mono">{category.slug}</td>
                <td>{usageCount}</td>
                <td>
                  <div className="admin-row-actions">
                    <button type="button" className="admin-button admin-button--secondary" onClick={() => onEdit(category)}>
                      Editar
                    </button>
                    <button type="button" className="admin-button admin-button--danger" onClick={() => onDelete(category.id)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
