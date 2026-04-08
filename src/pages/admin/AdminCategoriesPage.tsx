import { useEffect, useMemo, useState } from 'react'
import { CategoriesList } from '../../components/admin/CategoriesList'
import { CategoryForm } from '../../components/admin/CategoryForm'
import { ErrorState } from '../../components/admin/ErrorState'
import { LoadingState } from '../../components/admin/LoadingState'
import { createCategory, deleteCategory, fetchAdminLookupData, updateCategory } from '../../services/adminService'
import type { Category } from '../../types/catalog'
import type { AdminCategoryFormState } from '../../types/admin'
import { createEmptyCategoryFormState, mapCategoryToFormState } from '../../utils/admin'

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [usageCountByCategoryId, setUsageCountByCategoryId] = useState<Record<string, number>>({})
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const initialValues = useMemo<AdminCategoryFormState>(() => {
    return selectedCategory ? mapCategoryToFormState(selectedCategory) : createEmptyCategoryFormState()
  }, [selectedCategory])

  useEffect(() => {
    let cancelled = false

    const load = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const lookupData = await fetchAdminLookupData()
        if (!cancelled) {
          setCategories(lookupData.categories)
          const usageMap: Record<string, number> = {}
          for (const category of lookupData.categories) {
            usageMap[category.id] = lookupData.establishments.filter((item) => item.primary_category_id === category.id).length
          }
          setUsageCountByCategoryId(usageMap)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar categorias.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const refresh = async (): Promise<void> => {
    const lookupData = await fetchAdminLookupData()
    setCategories(lookupData.categories)
    const usageMap: Record<string, number> = {}
    for (const category of lookupData.categories) {
      usageMap[category.id] = lookupData.establishments.filter((item) => item.primary_category_id === category.id).length
    }
    setUsageCountByCategoryId(usageMap)
  }

  const handleSubmit = async (values: AdminCategoryFormState): Promise<void> => {
    setSaving(true)
    setMessage(null)
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, values)
        setMessage('Categoria atualizada com sucesso.')
      } else {
        await createCategory(values)
        setMessage('Categoria criada com sucesso.')
      }
      setSelectedCategory(null)
      await refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (categoryId: string): Promise<void> => {
    setMessage(null)
    try {
      await deleteCategory(categoryId)
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null)
      }
      await refresh()
      setMessage('Categoria excluída.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir a categoria.')
    }
  }

  if (loading) {
    return <LoadingState label="Carregando categorias..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Categorias</h1>
          <p>Crie, edite e exclua categorias quando não estiverem em uso.</p>
        </div>
      </div>

      {message ? <p className="admin-success">{message}</p> : null}

      <div className="admin-split">
        <CategoryForm
          key={selectedCategory?.id ?? 'new-category'}
          title={selectedCategory ? 'Editar categoria' : 'Nova categoria'}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          onCancel={() => setSelectedCategory(null)}
          busy={saving}
        />

        <CategoriesList
          categories={categories}
          usageCountByCategoryId={usageCountByCategoryId}
          onEdit={setSelectedCategory}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
