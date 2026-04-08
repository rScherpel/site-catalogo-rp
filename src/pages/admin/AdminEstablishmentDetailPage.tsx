import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminEstablishmentForm } from '../../components/admin/AdminEstablishmentForm'
import { ErrorState } from '../../components/admin/ErrorState'
import { LoadingState } from '../../components/admin/LoadingState'
import { fetchAdminCategories, fetchAdminEstablishmentById, saveEstablishmentHours, toggleEstablishmentActive, updateEstablishment } from '../../services/adminService'
import type { Category } from '../../types/catalog'
import type { AdminEstablishmentFormState, AdminEstablishmentRecord } from '../../types/admin'
import { mapEstablishmentToFormState } from '../../utils/admin'

export function AdminEstablishmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [record, setRecord] = useState<AdminEstablishmentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async (): Promise<void> => {
      if (!id) {
        setError('ID inválido.')
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        const [nextCategories, nextRecord] = await Promise.all([
          fetchAdminCategories(),
          fetchAdminEstablishmentById(id),
        ])

        if (!cancelled) {
          setCategories(nextCategories)
          setRecord(nextRecord)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar o estabelecimento.')
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
  }, [id])

  if (loading) {
    return <LoadingState label="Carregando estabelecimento..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  if (!record) {
    return <ErrorState message="Estabelecimento não encontrado." onRetry={() => navigate('/admin/establishments')} />
  }

  const handleSubmit = async (values: AdminEstablishmentFormState): Promise<void> => {
    if (!id) {
      return
    }

    setSaving(true)
    try {
      await updateEstablishment(id, {
        name: values.name,
        slug: values.slug,
        logo_url: values.logo_url || null,
        phone: values.phone,
        whatsapp: values.whatsapp || null,
        address: values.address,
        maps_url: values.maps_url || null,
        sponsored: values.sponsored,
        active: values.active,
        primary_category_id: values.primary_category_id,
        keywords: values.keywordsInput.split(',').map((item) => item.trim()).filter(Boolean),
      })
      await saveEstablishmentHours(id, values.hours)
      const nextRecord = await fetchAdminEstablishmentById(id)
      setRecord(nextRecord)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (): Promise<void> => {
    if (!id) {
      return
    }

    await toggleEstablishmentActive(id, !record.establishment.active)
    const nextRecord = await fetchAdminEstablishmentById(id)
    setRecord(nextRecord)
  }

  return (
    <div className="admin-page">
      <AdminEstablishmentForm
        key={record.establishment.id}
        title={record.establishment.name}
        initialValues={mapEstablishmentToFormState(record.establishment, record.hours)}
        categories={categories}
        onSubmit={handleSubmit}
        onBack={() => navigate('/admin/establishments')}
        onToggleActive={handleToggleActive}
        busy={saving}
      />
    </div>
  )
}
