import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminEstablishmentForm } from '../../components/admin/AdminEstablishmentForm'
import { ErrorState } from '../../components/admin/ErrorState'
import { LoadingState } from '../../components/admin/LoadingState'
import { fetchAdminCategories, createEstablishment, saveEstablishmentHours } from '../../services/adminService'
import { buildEstablishmentPayload, createEmptyEstablishmentFormState } from '../../utils/admin'
import type { Category } from '../../types/catalog'
import type { AdminEstablishmentFormState } from '../../types/admin'

export function AdminEstablishmentNewPage() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialValues = createEmptyEstablishmentFormState()

  useEffect(() => {
    let cancelled = false

    const load = async (): Promise<void> => {
      setLoading(true)

      try {
        const nextCategories = await fetchAdminCategories()
        if (!cancelled) {
          setCategories(nextCategories)
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

  if (loading) {
    return <LoadingState label="Carregando formulário..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  const handleSubmit = async (values: AdminEstablishmentFormState): Promise<void> => {
    setSaving(true)
    try {
      const payload = buildEstablishmentPayload(values)
      const created = await createEstablishment(payload)

      await saveEstablishmentHours(created.id, values.hours)
      navigate(`/admin/establishments/${created.id}`, { replace: true })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-page">
      <AdminEstablishmentForm
        key="new-establishment"
        title="Novo estabelecimento"
        initialValues={initialValues}
        categories={categories}
        onSubmit={handleSubmit}
        onBack={() => navigate('/admin/establishments')}
        busy={saving}
      />
    </div>
  )
}
