import type { Category, CatalogData, Establishment, EstablishmentHour, MonthlyAccess, Weekday } from '../types/catalog'
import { getMonthKey, getPreviousMonthKey } from '../utils/access'

const seedTimestamp = new Date('2026-04-07T09:00:00-03:00').toISOString()
const currentMonthKey = getMonthKey()
const previousMonthKey = getPreviousMonthKey()

function makeLogo(initials: string, background: string, foreground: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${initials}">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0.18" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="32" fill="url(#bg)" />
      <circle cx="100" cy="28" r="18" fill="#ffffff" fill-opacity="0.18" />
      <text
        x="64"
        y="74"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="DM Sans, Segoe UI, sans-serif"
        font-size="40"
        font-weight="700"
        fill="${foreground}"
      >
        ${initials}
      </text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function buildMapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

type DaySchedule = Partial<Record<Weekday, Array<readonly [string, string]>>>

function createHours(establishmentId: string, schedule: DaySchedule): EstablishmentHour[] {
  return Object.entries(schedule).flatMap(([weekdayText, intervals]) => {
    const weekday = Number(weekdayText) as Weekday

    return (intervals ?? []).slice(0, 2).map(([openTime, closeTime], intervalIndex) => ({
      id: `${establishmentId}-${weekday}-${intervalIndex + 1}`,
      establishment_id: establishmentId,
      weekday,
      interval_index: (intervalIndex + 1) as 1 | 2,
      open_time: openTime,
      close_time: closeTime,
    }))
  })
}

export const mockCategories: Category[] = [
  { id: 'cat-food', slug: 'alimentacao', label: 'Alimentação', created_at: seedTimestamp },
  { id: 'cat-health', slug: 'saude', label: 'Saúde', created_at: seedTimestamp },
  { id: 'cat-beauty', slug: 'beleza', label: 'Beleza', created_at: seedTimestamp },
  { id: 'cat-market', slug: 'mercado', label: 'Mercado', created_at: seedTimestamp },
  { id: 'cat-services', slug: 'servicos', label: 'Serviços', created_at: seedTimestamp },
  { id: 'cat-leisure', slug: 'lazer', label: 'Lazer', created_at: seedTimestamp },
]

export const mockEstablishments: Establishment[] = [
  {
    id: 'est-padaria-central',
    slug: 'padaria-central',
    name: 'Padaria Central',
    logo_url: makeLogo('PC', '#0f766e', '#ecfeff'),
    phone: '(27) 3333-1001',
    whatsapp: '(27) 99911-1001',
    address: 'Rua das Flores, 120 - Centro',
    maps_url: buildMapsUrl('Rua das Flores, 120 - Centro'),
    sponsored: true,
    primary_category_id: 'cat-food',
    keywords: ['pão', 'café da manhã', 'bolos', 'lanches', 'doces'],
    active: true,
    created_at: seedTimestamp,
    updated_at: seedTimestamp,
  },
  {
    id: 'est-farmacia-vida',
    slug: 'farmacia-vida',
    name: 'Farmácia Vida',
    logo_url: makeLogo('FV', '#1d4ed8', '#eff6ff'),
    phone: '(27) 3333-2002',
    whatsapp: '(27) 99822-2002',
    address: 'Avenida Brasil, 45 - Jardim América',
    maps_url: buildMapsUrl('Avenida Brasil, 45 - Jardim América'),
    sponsored: false,
    primary_category_id: 'cat-health',
    keywords: ['medicamentos', 'entrega', 'vacinas', 'genéricos', 'perfumes'],
    active: true,
    created_at: seedTimestamp,
    updated_at: seedTimestamp,
  },
  {
    id: 'est-salao-bela-vista',
    slug: 'salao-bela-vista',
    name: 'Salão Bela Vista',
    logo_url: makeLogo('SB', '#be185d', '#fff1f2'),
    phone: '(27) 3333-3003',
    whatsapp: '(27) 99733-3003',
    address: 'Praça da Matriz, 18 - Vila Nova',
    maps_url: buildMapsUrl('Praça da Matriz, 18 - Vila Nova'),
    sponsored: true,
    primary_category_id: 'cat-beauty',
    keywords: ['corte', 'escova', 'coloração', 'unhas', 'barba'],
    active: true,
    created_at: seedTimestamp,
    updated_at: seedTimestamp,
  },
  {
    id: 'est-mercado-municipal',
    slug: 'mercado-municipal',
    name: 'Mercado Municipal',
    logo_url: makeLogo('MM', '#ea580c', '#fff7ed'),
    phone: '(27) 3333-4004',
    whatsapp: '(27) 99644-4004',
    address: 'Rua do Comércio, 88 - Centro',
    maps_url: buildMapsUrl('Rua do Comércio, 88 - Centro'),
    sponsored: false,
    primary_category_id: 'cat-market',
    keywords: ['hortifruti', 'açougue', 'padaria interna', 'bebidas', 'limpeza'],
    active: true,
    created_at: seedTimestamp,
    updated_at: seedTimestamp,
  },
  {
    id: 'est-auto-center-rapido',
    slug: 'auto-center-rapido',
    name: 'Auto Center Rápido',
    logo_url: makeLogo('AC', '#334155', '#f8fafc'),
    phone: '(27) 3333-5005',
    whatsapp: '(27) 99555-5005',
    address: 'Rodovia do Sol, 900 - Distrito Industrial',
    maps_url: buildMapsUrl('Rodovia do Sol, 900 - Distrito Industrial'),
    sponsored: false,
    primary_category_id: 'cat-services',
    keywords: ['troca de óleo', 'alinhamento', 'pneus', 'freios', 'revisão'],
    active: true,
    created_at: seedTimestamp,
    updated_at: seedTimestamp,
  },
  {
    id: 'est-clinica-sorriso',
    slug: 'clinica-sorriso',
    name: 'Clínica Sorriso',
    logo_url: makeLogo('CS', '#16a34a', '#f0fdf4'),
    phone: '(27) 3333-6006',
    whatsapp: '(27) 99466-6006',
    address: 'Avenida Saúde, 77 - Bairro Novo',
    maps_url: buildMapsUrl('Avenida Saúde, 77 - Bairro Novo'),
    sponsored: false,
    primary_category_id: 'cat-health',
    keywords: ['dentista', 'ortodontia', 'limpeza', 'emergência', 'convênio'],
    active: true,
    created_at: seedTimestamp,
    updated_at: seedTimestamp,
  },
]

export const mockEstablishmentHours: EstablishmentHour[] = [
  ...createHours('est-padaria-central', {
    1: [['06:30', '18:30']],
    2: [['06:30', '18:30']],
    3: [['06:30', '18:30']],
    4: [['06:30', '18:30']],
    5: [['06:30', '18:30']],
    6: [['06:30', '14:00']],
    0: [['07:00', '12:00']],
  }),
  ...createHours('est-farmacia-vida', {
    1: [
      ['08:00', '12:30'],
      ['14:00', '20:00'],
    ],
    2: [
      ['08:00', '12:30'],
      ['14:00', '20:00'],
    ],
    3: [
      ['08:00', '12:30'],
      ['14:00', '20:00'],
    ],
    4: [
      ['08:00', '12:30'],
      ['14:00', '20:00'],
    ],
    5: [
      ['08:00', '12:30'],
      ['14:00', '20:00'],
    ],
    6: [
      ['08:30', '12:00'],
      ['13:30', '18:00'],
    ],
  }),
  ...createHours('est-salao-bela-vista', {
    2: [
      ['09:00', '12:00'],
      ['13:00', '19:00'],
    ],
    3: [
      ['09:00', '12:00'],
      ['13:00', '19:00'],
    ],
    4: [
      ['09:00', '12:00'],
      ['13:00', '19:00'],
    ],
    5: [
      ['09:00', '12:00'],
      ['13:00', '19:00'],
    ],
    6: [
      ['09:00', '12:00'],
      ['13:00', '17:00'],
    ],
  }),
  ...createHours('est-mercado-municipal', {
    0: [['08:00', '13:00']],
    1: [['07:00', '21:00']],
    2: [['07:00', '21:00']],
    3: [['07:00', '21:00']],
    4: [['07:00', '21:00']],
    5: [['07:00', '21:00']],
    6: [['07:00', '21:00']],
  }),
  ...createHours('est-auto-center-rapido', {
    1: [
      ['08:00', '12:00'],
      ['13:30', '18:00'],
    ],
    2: [
      ['08:00', '12:00'],
      ['13:30', '18:00'],
    ],
    3: [
      ['08:00', '12:00'],
      ['13:30', '18:00'],
    ],
    4: [
      ['08:00', '12:00'],
      ['13:30', '18:00'],
    ],
    5: [
      ['08:00', '12:00'],
      ['13:30', '18:00'],
    ],
    6: [['08:00', '12:00']],
  }),
  ...createHours('est-clinica-sorriso', {
    1: [
      ['08:00', '12:00'],
      ['14:00', '18:00'],
    ],
    2: [
      ['08:00', '12:00'],
      ['14:00', '18:00'],
    ],
    3: [
      ['08:00', '12:00'],
      ['14:00', '18:00'],
    ],
    4: [
      ['08:00', '12:00'],
      ['14:00', '18:00'],
    ],
    5: [
      ['08:00', '12:00'],
      ['14:00', '18:00'],
    ],
    6: [['08:00', '12:00']],
  }),
]

export const mockMonthlyAccesses: MonthlyAccess[] = [
  {
    id: 'access-padaria-central-current',
    establishment_id: 'est-padaria-central',
    month_key: currentMonthKey,
    access_count: 412,
    updated_at: seedTimestamp,
  },
  {
    id: 'access-farmacia-vida-current',
    establishment_id: 'est-farmacia-vida',
    month_key: currentMonthKey,
    access_count: 286,
    updated_at: seedTimestamp,
  },
  {
    id: 'access-salao-bela-vista-current',
    establishment_id: 'est-salao-bela-vista',
    month_key: currentMonthKey,
    access_count: 198,
    updated_at: seedTimestamp,
  },
  {
    id: 'access-mercado-municipal-current',
    establishment_id: 'est-mercado-municipal',
    month_key: currentMonthKey,
    access_count: 625,
    updated_at: seedTimestamp,
  },
  {
    id: 'access-auto-center-rapido-current',
    establishment_id: 'est-auto-center-rapido',
    month_key: currentMonthKey,
    access_count: 173,
    updated_at: seedTimestamp,
  },
  {
    id: 'access-clinica-sorriso-current',
    establishment_id: 'est-clinica-sorriso',
    month_key: currentMonthKey,
    access_count: 341,
    updated_at: seedTimestamp,
  },
  {
    id: 'access-padaria-central-previous',
    establishment_id: 'est-padaria-central',
    month_key: previousMonthKey,
    access_count: 368,
    updated_at: seedTimestamp,
  },
  {
    id: 'access-mercado-municipal-previous',
    establishment_id: 'est-mercado-municipal',
    month_key: previousMonthKey,
    access_count: 590,
    updated_at: seedTimestamp,
  },
]

export const mockCatalogData: CatalogData = {
  categories: mockCategories,
  establishments: mockEstablishments,
  hours: mockEstablishmentHours,
  monthlyAccesses: mockMonthlyAccesses,
}
