import { useEffect, useState } from 'react'
import { AccessRankingTable } from '../../components/admin/AccessRankingTable'
import { ErrorState } from '../../components/admin/ErrorState'
import { LoadingState } from '../../components/admin/LoadingState'
import { MonthPicker } from '../../components/admin/MonthPicker'
import { fetchMonthlyAccessRanking } from '../../services/adminService'
import type { AdminAccessRankingItem } from '../../types/admin'
import { getMonthKey } from '../../utils/access'

export function AdminAccessesPage() {
  const [monthKey, setMonthKey] = useState(getMonthKey())
  const [items, setItems] = useState<AdminAccessRankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const nextItems = await fetchMonthlyAccessRanking(monthKey)
        if (!cancelled) {
          setItems(nextItems)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar acessos.')
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
  }, [monthKey])

  if (loading) {
    return <LoadingState label="Carregando acessos..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Acessos mensais</h1>
          <p>Ranking por mês com nome, categoria e quantidade de acessos.</p>
        </div>

        <MonthPicker value={monthKey} onChange={setMonthKey} />
      </div>

      {items.length === 0 ? (
        <p className="admin-muted">Nenhum acesso registrado para este mês.</p>
      ) : (
        <AccessRankingTable items={items} />
      )}
    </div>
  )
}
