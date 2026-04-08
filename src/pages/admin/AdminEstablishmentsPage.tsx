import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EstablishmentsList } from '../../components/admin/EstablishmentsList'
import { ErrorState } from '../../components/admin/ErrorState'
import { LoadingState } from '../../components/admin/LoadingState'
import { fetchAdminEstablishments } from '../../services/adminService'
import type { AdminEstablishmentListItem } from '../../types/admin'

export function AdminEstablishmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState<AdminEstablishmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const nextItems = await fetchAdminEstablishments(searchTerm)
        if (!cancelled) {
          setItems(nextItems)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Falha ao carregar estabelecimentos.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    const timeout = window.setTimeout(() => {
      void load()
    }, 150)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [searchTerm])

  if (loading) {
    return <LoadingState label="Carregando estabelecimentos..." />
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Estabelecimentos</h1>
          <p>Busque por nome, keywords ou ID.</p>
        </div>

        <Link className="admin-button admin-button--primary" to="/admin/establishments/new">
          Criar novo estabelecimento
        </Link>
      </div>

      <label className="admin-field admin-field--wide">
        <span>Busca</span>
        <input
          className="admin-input"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Pesquisar por nome, keywords ou id"
        />
      </label>

      {items.length === 0 ? (
        <p className="admin-muted">Nenhum estabelecimento encontrado.</p>
      ) : (
        <EstablishmentsList items={items} />
      )}
    </div>
  )
}
