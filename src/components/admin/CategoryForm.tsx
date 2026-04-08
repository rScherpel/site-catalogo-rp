import { useState, type FormEvent } from 'react'
import type { AdminCategoryFormState } from '../../types/admin'
import { buildCategoryPayload, slugify } from '../../utils/admin'

interface CategoryFormProps {
  initialValues: AdminCategoryFormState
  onSubmit: (values: AdminCategoryFormState) => Promise<void>
  onCancel: () => void
  busy?: boolean
  title: string
}

export function CategoryForm({ initialValues, onSubmit, onCancel, busy = false, title }: CategoryFormProps) {
  const [values, setValues] = useState<AdminCategoryFormState>(initialValues)
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)

    if (!values.label.trim()) {
      setError('Informe o nome da categoria.')
      return
    }

    const payload = buildCategoryPayload(values)
    if (!payload.slug) {
      setError('Não foi possível gerar o slug da categoria.')
      return
    }

    await onSubmit({
      label: payload.label,
      slug: payload.slug,
    })
  }

  const derivedSlug = slugify(values.label)

  return (
    <form className="admin-form" onSubmit={(event) => void handleSubmit(event)}>
      <div className="admin-form__header">
        <h3>{title}</h3>
      </div>

      <label className="admin-field">
        <span>Nome</span>
        <input
          className="admin-input"
          value={values.label}
          onChange={(event) => {
            const nextLabel = event.target.value
            setValues((current) => ({
              ...current,
              label: nextLabel,
              slug: slugTouched ? current.slug : slugify(nextLabel),
            }))
          }}
          placeholder="Ex.: Alimentação"
        />
      </label>

      <label className="admin-field">
        <span>Slug</span>
        <input
          className="admin-input"
          value={values.slug}
          onChange={(event) => {
            setSlugTouched(true)
            setValues((current) => ({ ...current, slug: slugify(event.target.value) }))
          }}
          placeholder={derivedSlug}
        />
      </label>

      {error ? <p className="admin-form__error">{error}</p> : null}

      <div className="admin-form__actions">
        <button type="button" className="admin-button admin-button--secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="admin-button admin-button--primary" disabled={busy}>
          {busy ? 'Salvando...' : 'Salvar categoria'}
        </button>
      </div>
    </form>
  )
}
