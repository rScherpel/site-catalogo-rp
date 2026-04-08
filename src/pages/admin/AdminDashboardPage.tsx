import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminDashboard } from '../../services/adminService'
import type { AdminDashboardData } from '../../types/admin'
import { ErrorState } from '../../components/admin/ErrorState'
import { LoadingState } from '../../components/admin/LoadingState'
import { SummaryCard } from '../../components/admin/SummaryCard'
import { TopAccessList } from '../../components/admin/TopAccessList'

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const dashboard = await fetchAdminDashboard()

        if (!cancelled) {
          setData(dashboard)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar dashboard.')
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
    return <LoadingState label="Carregando dashboard..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  if (!data) {
    return <ErrorState message="Nenhum dado disponível." />
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumo rápido da operação do catálogo.</p>
        </div>

        <div className="admin-row-actions">
          <Link className="admin-button admin-button--secondary" to="/admin/establishments/new">
            Criar novo estabelecimento
          </Link>
          <Link className="admin-button admin-button--secondary" to="/admin/establishments">
            Ver estabelecimentos
          </Link>
          <Link className="admin-button admin-button--secondary" to="/admin/categories">
            Ver categorias
          </Link>
        </div>
      </div>

      <div className="admin-summary-grid">
        <SummaryCard label="Total de estabelecimentos" value={data.totalEstablishments} tone="brand" />
        <SummaryCard label="Ativos" value={data.totalActiveEstablishments} tone="success" />
        <SummaryCard label="Patrocinados" value={data.totalSponsoredEstablishments} tone="accent" />
        <SummaryCard label="Categorias" value={data.totalCategories} tone="warning" />
      </div>

      <TopAccessList items={data.topAccesses} />
    </div>
  )
}
