export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D+/g, '')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizePhoneNumber(phone)}?text=${encodeURIComponent(message)}`
}

export function buildMapsUrl(mapsUrl: string | null | undefined, address: string): string {
  if (mapsUrl?.trim()) {
    return mapsUrl.trim()
  }

  if (!address.trim()) {
    return ''
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
