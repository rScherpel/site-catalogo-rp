import { useCallback, useEffect, useState } from 'react'
import { hasSupabaseConfig } from '../lib/supabaseClient'
import type { CatalogData, CatalogEntry, MonthlyAccess } from '../types/catalog'
import { getMonthKey } from '../utils/access'
import { buildCatalogEntries } from '../utils/catalog'
import { fetchCatalogData, incrementMonthlyAccess } from '../services/catalogService'

export interface UseCatalogDataResult {
  catalogData: CatalogData | null
  entries: CatalogEntry[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  trackAccess: (establishmentId: string) => Promise<void>
  monthKey: string
  isDemoMode: boolean
}

function upsertMonthlyAccess(
  monthlyAccesses: MonthlyAccess[],
  establishmentId: string,
  monthKey: string,
  accessCount: number,
): MonthlyAccess[] {
  const nextMonthlyAccesses = [...monthlyAccesses]
  const existingIndex = nextMonthlyAccesses.findIndex(
    (monthlyAccess) =>
      monthlyAccess.establishment_id === establishmentId && monthlyAccess.month_key === monthKey,
  )

  const nextRecord: MonthlyAccess = {
    id: existingIndex >= 0 ? nextMonthlyAccesses[existingIndex].id : `local-${establishmentId}-${monthKey}`,
    establishment_id: establishmentId,
    month_key: monthKey,
    access_count: accessCount,
    updated_at: new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    nextMonthlyAccesses[existingIndex] = nextRecord
    return nextMonthlyAccesses
  }

  nextMonthlyAccesses.push(nextRecord)
  return nextMonthlyAccesses
}

export function useCatalogData(): UseCatalogDataResult {
  const monthKey = getMonthKey()
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null)
  const [entries, setEntries] = useState<CatalogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyCatalogData = useCallback(
    (data: CatalogData): void => {
      setCatalogData(data)
      setEntries(buildCatalogEntries(data, monthKey))
    },
    [monthKey],
  )

  useEffect(() => {
    let cancelled = false

    const run = async (): Promise<void> => {
      setLoading(true)
      setError(null)

      try {
        const data = await fetchCatalogData(monthKey)

        if (cancelled) {
          return
        }

        applyCatalogData(data)
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o catálogo.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [monthKey, applyCatalogData])

  const refresh = async (): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchCatalogData(monthKey)
      applyCatalogData(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar o catálogo.')
    } finally {
      setLoading(false)
    }
  }

  const trackAccess = async (establishmentId: string): Promise<void> => {
    try {
      const nextAccessCount = await incrementMonthlyAccess(establishmentId, monthKey)

      setCatalogData((current) => {
        if (!current) {
          return current
        }

        return {
          ...current,
          monthlyAccesses: upsertMonthlyAccess(
            current.monthlyAccesses,
            establishmentId,
            monthKey,
            nextAccessCount,
          ),
        }
      })

      setEntries((currentEntries) =>
        currentEntries.map((entry) =>
          entry.id === establishmentId
            ? {
                ...entry,
                monthlyAccessCount: nextAccessCount,
              }
            : entry,
        ),
      )

      return
    } catch (trackError) {
      if (hasSupabaseConfig) {
        console.error('Falha ao registrar acesso mensal:', trackError)
      }

      return
    }
  }

  return {
    catalogData,
    entries,
    loading,
    error,
    refresh,
    trackAccess,
    monthKey,
    isDemoMode: !hasSupabaseConfig,
  }
}
