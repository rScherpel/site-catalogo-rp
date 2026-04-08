insert into public.categories (id, slug, label)
values
  ('11111111-1111-1111-1111-000000000001', 'alimentacao', 'Alimentação'),
  ('11111111-1111-1111-1111-000000000002', 'saude', 'Saúde'),
  ('11111111-1111-1111-1111-000000000003', 'beleza', 'Beleza'),
  ('11111111-1111-1111-1111-000000000004', 'mercado', 'Mercado'),
  ('11111111-1111-1111-1111-000000000005', 'servicos', 'Serviços'),
  ('11111111-1111-1111-1111-000000000006', 'lazer', 'Lazer')
on conflict (slug) do update set
  label = excluded.label;

insert into public.establishments (
  id,
  slug,
  name,
  logo_url,
  phone,
  whatsapp,
  instagram_url,
  address,
  maps_url,
  virtual_store,
  sponsored,
  primary_category_id,
  keywords,
  active
)
values
  (
    '22222222-2222-2222-2222-000000000001',
    'padaria-central',
    'Padaria Central',
    'https://placehold.co/128x128/0f766e/ecfeff?text=PC',
    '(27) 3333-1001',
    '(27) 99911-1001',
    null,
    'Rua das Flores, 120 - Centro',
    'https://www.google.com/maps/search/?api=1&query=Rua%20das%20Flores%2C%20120%20-%20Centro',
    false,
    true,
    (select id from public.categories where slug = 'alimentacao'),
    array['pão', 'café da manhã', 'bolos', 'lanches', 'doces']::text[],
    true
  ),
  (
    '22222222-2222-2222-2222-000000000002',
    'farmacia-vida',
    'Farmácia Vida',
    'https://placehold.co/128x128/1d4ed8/eff6ff?text=FV',
    '(27) 3333-2002',
    '(27) 99822-2002',
    null,
    'Avenida Brasil, 45 - Jardim América',
    'https://www.google.com/maps/search/?api=1&query=Avenida%20Brasil%2C%2045%20-%20Jardim%20Am%C3%A9rica',
    false,
    false,
    (select id from public.categories where slug = 'saude'),
    array['medicamentos', 'entrega', 'vacinas', 'genéricos', 'perfumes']::text[],
    true
  ),
  (
    '22222222-2222-2222-2222-000000000003',
    'salao-bela-vista',
    'Salão Bela Vista',
    'https://placehold.co/128x128/be185d/fff1f2?text=SB',
    '(27) 3333-3003',
    '(27) 99733-3003',
    null,
    'Praça da Matriz, 18 - Vila Nova',
    'https://www.google.com/maps/search/?api=1&query=Pra%C3%A7a%20da%20Matriz%2C%2018%20-%20Vila%20Nova',
    false,
    true,
    (select id from public.categories where slug = 'beleza'),
    array['corte', 'escova', 'coloração', 'unhas', 'barba']::text[],
    true
  ),
  (
    '22222222-2222-2222-2222-000000000004',
    'mercado-municipal',
    'Mercado Municipal',
    'https://placehold.co/128x128/ea580c/fff7ed?text=MM',
    '(27) 3333-4004',
    '(27) 99644-4004',
    null,
    'Rua do Comércio, 88 - Centro',
    'https://www.google.com/maps/search/?api=1&query=Rua%20do%20Com%C3%A9rcio%2C%2088%20-%20Centro',
    false,
    false,
    (select id from public.categories where slug = 'mercado'),
    array['hortifruti', 'açougue', 'padaria interna', 'bebidas', 'limpeza']::text[],
    true
  ),
  (
    '22222222-2222-2222-2222-000000000005',
    'auto-center-rapido',
    'Auto Center Rápido',
    'https://placehold.co/128x128/334155/f8fafc?text=AC',
    '(27) 3333-5005',
    '(27) 99555-5005',
    null,
    'Rodovia do Sol, 900 - Distrito Industrial',
    'https://www.google.com/maps/search/?api=1&query=Rodovia%20do%20Sol%2C%20900%20-%20Distrito%20Industrial',
    false,
    false,
    (select id from public.categories where slug = 'servicos'),
    array['troca de óleo', 'alinhamento', 'pneus', 'freios', 'revisão']::text[],
    true
  ),
  (
    '22222222-2222-2222-2222-000000000006',
    'clinica-sorriso',
    'Clínica Sorriso',
    'https://placehold.co/128x128/16a34a/f0fdf4?text=CS',
    '(27) 3333-6006',
    '(27) 99466-6006',
    null,
    'Avenida Saúde, 77 - Bairro Novo',
    'https://www.google.com/maps/search/?api=1&query=Avenida%20Sa%C3%BAde%2C%2077%20-%20Bairro%20Novo',
    false,
    false,
    (select id from public.categories where slug = 'saude'),
    array['dentista', 'ortodontia', 'limpeza', 'emergência', 'convênio']::text[],
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  logo_url = excluded.logo_url,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  instagram_url = excluded.instagram_url,
  address = excluded.address,
  maps_url = excluded.maps_url,
  virtual_store = excluded.virtual_store,
  sponsored = excluded.sponsored,
  primary_category_id = excluded.primary_category_id,
  keywords = excluded.keywords,
  active = excluded.active,
  updated_at = now();

insert into public.establishment_hours (
  id,
  establishment_id,
  weekday,
  interval_index,
  open_time,
  close_time
)
values
  (gen_random_uuid(), (select id from public.establishments where slug = 'padaria-central'), 0, 1, '07:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'padaria-central'), 1, 1, '06:30', '18:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'padaria-central'), 2, 1, '06:30', '18:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'padaria-central'), 3, 1, '06:30', '18:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'padaria-central'), 4, 1, '06:30', '18:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'padaria-central'), 5, 1, '06:30', '18:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'padaria-central'), 6, 1, '06:30', '14:00'),

  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 1, 1, '08:00', '12:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 1, 2, '14:00', '20:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 2, 1, '08:00', '12:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 2, 2, '14:00', '20:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 3, 1, '08:00', '12:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 3, 2, '14:00', '20:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 4, 1, '08:00', '12:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 4, 2, '14:00', '20:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 5, 1, '08:00', '12:30'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 5, 2, '14:00', '20:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 6, 1, '08:30', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), 6, 2, '13:30', '18:00'),

  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 2, 1, '09:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 2, 2, '13:00', '19:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 3, 1, '09:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 3, 2, '13:00', '19:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 4, 1, '09:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 4, 2, '13:00', '19:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 5, 1, '09:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 5, 2, '13:00', '19:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 6, 1, '09:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), 6, 2, '13:00', '17:00'),

  (gen_random_uuid(), (select id from public.establishments where slug = 'mercado-municipal'), 0, 1, '08:00', '13:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'mercado-municipal'), 1, 1, '07:00', '21:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'mercado-municipal'), 2, 1, '07:00', '21:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'mercado-municipal'), 3, 1, '07:00', '21:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'mercado-municipal'), 4, 1, '07:00', '21:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'mercado-municipal'), 5, 1, '07:00', '21:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'mercado-municipal'), 6, 1, '07:00', '21:00'),

  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 1, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 1, 2, '13:30', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 2, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 2, 2, '13:30', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 3, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 3, 2, '13:30', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 4, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 4, 2, '13:30', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 5, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 5, 2, '13:30', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), 6, 1, '08:00', '12:00'),

  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 1, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 1, 2, '14:00', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 2, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 2, 2, '14:00', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 3, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 3, 2, '14:00', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 4, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 4, 2, '14:00', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 5, 1, '08:00', '12:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 5, 2, '14:00', '18:00'),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), 6, 1, '08:00', '12:00')
on conflict (establishment_id, weekday, interval_index) do update set
  open_time = excluded.open_time,
  close_time = excluded.close_time;

insert into public.monthly_accesses (
  id,
  establishment_id,
  month_key,
  access_count,
  updated_at
)
values
  (gen_random_uuid(), (select id from public.establishments where slug = 'padaria-central'), '2026-04', 412, now()),
  (gen_random_uuid(), (select id from public.establishments where slug = 'farmacia-vida'), '2026-04', 286, now()),
  (gen_random_uuid(), (select id from public.establishments where slug = 'salao-bela-vista'), '2026-04', 198, now()),
  (gen_random_uuid(), (select id from public.establishments where slug = 'mercado-municipal'), '2026-04', 625, now()),
  (gen_random_uuid(), (select id from public.establishments where slug = 'auto-center-rapido'), '2026-04', 173, now()),
  (gen_random_uuid(), (select id from public.establishments where slug = 'clinica-sorriso'), '2026-04', 341, now()),
  (gen_random_uuid(), (select id from public.establishments where slug = 'padaria-central'), '2026-03', 368, now()),
  (gen_random_uuid(), (select id from public.establishments where slug = 'mercado-municipal'), '2026-03', 590, now())
on conflict (establishment_id, month_key) do update set
  access_count = excluded.access_count,
  updated_at = excluded.updated_at;
