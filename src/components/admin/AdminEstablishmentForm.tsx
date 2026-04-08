import { useRef, useState, type FormEvent } from 'react'
import type { Category } from '../../types/catalog'
import type { AdminEstablishmentFormState } from '../../types/admin'
import { HoursEditor } from './HoursEditor'
import { buildEstablishmentPayload, cloneHoursState, createEmptyHoursFormState, parseKeywordsInput, slugify } from '../../utils/admin'

interface AdminEstablishmentFormProps {
  title: string
  initialValues: AdminEstablishmentFormState
  categories: Category[]
  onSubmit: (values: AdminEstablishmentFormState) => Promise<void>
  onBack: () => void
  busy?: boolean
}

export function AdminEstablishmentForm({
  title,
  initialValues,
  categories,
  onSubmit,
  onBack,
  busy = false,
}: AdminEstablishmentFormProps) {
  const [values, setValues] = useState<AdminEstablishmentFormState>(() => ({
    ...initialValues,
    hours: cloneHoursState(initialValues.hours.length ? initialValues.hours : createEmptyHoursFormState()),
  }))
  const [error, setError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const lastAutoSlugSource = useRef(initialValues.name)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setError(null)

    const payload = buildEstablishmentPayload(values)

    if (!payload.name) {
      setError('Informe o nome do estabelecimento.')
      return
    }

    if (!payload.slug) {
      setError('Informe ou gere um slug válido.')
      return
    }

    if (!payload.phone) {
      setError('Informe o telefone.')
      return
    }

    if (!payload.address) {
      setError('Informe o endereço.')
      return
    }

    if (!payload.primary_category_id) {
      setError('Selecione uma categoria principal.')
      return
    }

    await onSubmit({
      ...values,
      name: payload.name,
      slug: payload.slug,
      logo_url: payload.logo_url ?? '',
      phone: payload.phone,
      whatsapp: payload.whatsapp ?? '',
      address: payload.address,
      maps_url: payload.maps_url ?? '',
      sponsored: payload.sponsored,
      active: payload.active,
      primary_category_id: payload.primary_category_id,
      keywordsInput: parseKeywordsInput(values.keywordsInput).join(', '),
      hours: values.hours,
    })
  }

  return (
    <form className="admin-form admin-form--wide" onSubmit={(event) => void handleSubmit(event)}>
      <div className="admin-form__header">
        <div>
          <h3>{title}</h3>
          <p>Preencha os campos com os dados atuais e salve tudo ao final da página.</p>
        </div>

        <div className="admin-row-actions">
          <button type="button" className="admin-button admin-button--secondary" onClick={onBack}>
            Voltar
          </button>
        </div>
      </div>

      <div className="admin-form-grid">
        <label className="admin-field">
          <span>Nome *</span>
          <input
            className="admin-input"
            value={values.name}
            onChange={(event) => {
              const nextName = event.target.value
              const shouldAutoUpdateSlug = !slugTouched && (values.slug.trim() === '' || values.slug === slugify(lastAutoSlugSource.current))
              setValues((current) => ({
                ...current,
                name: nextName,
                slug: shouldAutoUpdateSlug ? slugify(nextName) : current.slug,
              }))
              lastAutoSlugSource.current = nextName
            }}
            placeholder="Nome do estabelecimento"
          />
        </label>

        <label className="admin-field">
          <span>Slug *</span>
          <input
            className="admin-input"
            value={values.slug}
            onChange={(event) => {
              setSlugTouched(true)
              setValues((current) => ({ ...current, slug: slugify(event.target.value) }))
            }}
            placeholder="slug-do-estabelecimento"
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span>Logo URL</span>
          <input
            className="admin-input"
            value={values.logo_url}
            onChange={(event) => setValues((current) => ({ ...current, logo_url: event.target.value }))}
            placeholder="https://..."
          />
        </label>

        <label className="admin-field">
          <span>Telefone *</span>
          <input
            className="admin-input"
            value={values.phone}
            onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
            placeholder="(27) 3333-0000"
          />
        </label>

        <label className="admin-field">
          <span>WhatsApp</span>
          <input
            className="admin-input"
            value={values.whatsapp}
            onChange={(event) => setValues((current) => ({ ...current, whatsapp: event.target.value }))}
            placeholder="(27) 99999-0000"
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span>Endereço *</span>
          <input
            className="admin-input"
            value={values.address}
            onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
            placeholder="Rua, número, bairro"
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span>Maps URL</span>
          <input
            className="admin-input"
            value={values.maps_url}
            onChange={(event) => setValues((current) => ({ ...current, maps_url: event.target.value }))}
            placeholder="https://maps.google.com/..."
          />
        </label>

        <label className="admin-field">
          <span>Categoria principal *</span>
          <select
            className="admin-select"
            value={values.primary_category_id}
            onChange={(event) => setValues((current) => ({ ...current, primary_category_id: event.target.value }))}
          >
            <option value="">Selecione</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field admin-field--wide">
          <span>Palavras-chave</span>
          <textarea
            className="admin-input admin-input--textarea"
            value={values.keywordsInput}
            onChange={(event) => setValues((current) => ({ ...current, keywordsInput: event.target.value }))}
            placeholder="pão, café, padaria, lanche"
          />
        </label>

        <label className="admin-check">
          <input
            type="checkbox"
            checked={values.sponsored}
            onChange={(event) => setValues((current) => ({ ...current, sponsored: event.target.checked }))}
          />
          <span>Patrocinado</span>
        </label>

        <label className="admin-check">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(event) => setValues((current) => ({ ...current, active: event.target.checked }))}
          />
          <span>Ativo</span>
        </label>
      </div>

      <HoursEditor
        value={values.hours}
        onChange={(hours) => setValues((current) => ({ ...current, hours }))}
      />

      {error ? <p className="admin-form__error">{error}</p> : null}

      <div className="admin-form__actions admin-form__actions--sticky">
        <button type="button" className="admin-button admin-button--secondary" onClick={onBack}>
          Voltar para lista
        </button>
        <button type="submit" className="admin-button admin-button--primary" disabled={busy}>
          {busy ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
