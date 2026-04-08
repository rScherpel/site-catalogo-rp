import { useState } from 'react'
import type { CatalogEntry, EstablishmentStatus } from '../../types/catalog'
import { buildMapsUrl, buildWhatsAppUrl, normalizePhoneNumber } from '../../utils/contact'
import { formatHoursForDisplay, getEstablishmentStatus } from '../../utils/time'
import { normalizeImageUrl } from '../../utils/admin'

interface EstablishmentCardProps {
  establishment: CatalogEntry
  onTrackAccess: (establishmentId: string) => unknown
  now?: Date
}

const STATUS_LABELS: Record<EstablishmentStatus, string> = {
  open: 'Aberto',
  closed: 'Fechado',
  unavailable: 'Não informado',
}

const STATUS_CLASSNAMES: Record<EstablishmentStatus, string> = {
  open: 'badge badge--open',
  closed: 'badge badge--closed',
  unavailable: 'badge badge--unavailable',
}

function getInitials(name: string): string {
  const words = name.split(' ').filter(Boolean)

  if (words.length === 0) {
    return '--'
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export function EstablishmentCard({ establishment, onTrackAccess, now = new Date() }: EstablishmentCardProps) {
  const [logoFailed, setLogoFailed] = useState(false)
  const status = getEstablishmentStatus(establishment.hours, establishment.closed_weekdays, now)
  const hoursText = formatHoursForDisplay(establishment.hours, establishment.closed_weekdays)
  const whatsappNumber = establishment.whatsapp ?? establishment.phone
  const whatsappMessage = `Olá! Vi o estabelecimento ${establishment.name} no catálogo da cidade e gostaria de saber mais.`
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, whatsappMessage)
  const mapsUrl = establishment.virtual_store ? '' : buildMapsUrl(establishment.maps_url, establishment.address)
  const addressText = establishment.virtual_store ? 'Loja virtual' : establishment.address
  const phoneDigits = normalizePhoneNumber(establishment.phone)
  const cardClassName = `establishment-card${status === 'closed' ? ' establishment-card--closed' : ''}`

  return (
    <article className={cardClassName}>
      <div className="establishment-card__top">
        <div className="establishment-card__logo" aria-hidden="true">
          {!logoFailed && establishment.logo_url ? (
            <img
              src={normalizeImageUrl(establishment.logo_url)}
              alt=""
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="establishment-card__logo-placeholder">{getInitials(establishment.name)}</div>
          )}
        </div>

        <div className="establishment-card__head">
          <div className="establishment-card__title-row">
            <div>
              <h2 className="establishment-card__title">{establishment.name}</h2>
              <div className="establishment-card__badges">
                <span className={STATUS_CLASSNAMES[status]}>{STATUS_LABELS[status]}</span>
                <span className="badge badge--category">{establishment.category.label}</span>
                {establishment.sponsored ? <span className="badge badge--sponsored">Patrocinado</span> : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="establishment-card__details">
        <div className="establishment-card__detail">
          <span className="establishment-card__detail-label">Horário</span>
          <p className="establishment-card__detail-value establishment-card__hours">{hoursText}</p>
        </div>

        <div className="establishment-card__detail">
          <span className="establishment-card__detail-label">Endereço</span>
          <p className="establishment-card__detail-value">{addressText}</p>
        </div>

        <div className="establishment-card__detail">
          <span className="establishment-card__detail-label">Telefone</span>
          <p className="establishment-card__detail-value">
            <a
              className="inline-link"
              href={`tel:${phoneDigits}`}
              onClick={() => void onTrackAccess(establishment.id)}
            >
              {establishment.phone}
            </a>
          </p>
        </div>
      </div>

      <div className="establishment-card__actions">
        <a className="action-button action-button--primary" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => void onTrackAccess(establishment.id)}>
          WhatsApp
        </a>

        {establishment.instagram_url?.trim() ? (
          <a className="action-button action-button--secondary" href={establishment.instagram_url} target="_blank" rel="noreferrer" onClick={() => void onTrackAccess(establishment.id)}>
            Instagram
          </a>
        ) : null}

        {mapsUrl ? (
          <a className="action-button action-button--secondary" href={mapsUrl} target="_blank" rel="noreferrer" onClick={() => void onTrackAccess(establishment.id)}>
            Maps
          </a>
        ) : null}

        <a className="action-button action-button--secondary action-button--full" href={`tel:${phoneDigits}`} onClick={() => void onTrackAccess(establishment.id)}>
          Ligar
        </a>
      </div>

      <footer className="establishment-card__footer">
        <span className="establishment-card__keyword-count">
          {establishment.keywords.length} palavras-chave
        </span>
        <span className="establishment-card__access-count">{establishment.monthlyAccessCount} acessos no mês</span>
      </footer>
    </article>
  )
}
