# Catálogo da Cidade

Aplicação web em React + Vite + TypeScript para catálogo local de estabelecimentos com busca, filtros, status calculado no frontend, acesso mensal por estabelecimento e backoffice administrativo com Supabase Auth.

## Stack

- React
- Vite
- TypeScript
- Supabase
- CSS puro

## O que o projeto entrega

- Catálogo público com busca, filtros, ordenação e cards de estabelecimentos.
- Cálculo de status aberto, fechado ou indisponível com base em horários estruturados.
- Registro mensal de acessos por estabelecimento via RPC no Supabase.
- Backoffice administrativo com login, dashboard, listagem e edição de estabelecimentos e categorias.
- Página administrativa protegida com rota dedicada em `/admin`.

## Estrutura

- `src/types` - tipos de domínio do catálogo e do admin.
- `src/utils` - funções puras de horário, busca, contato, catálogo e admin.
- `src/lib` - cliente Supabase.
- `src/services` - acesso aos dados públicos e administrativos.
- `src/hooks` - carregamento de catálogo e auth do admin.
- `src/components/catalog` - componentes reutilizáveis da UI pública.
- `src/components/admin` - layout, navegação, guard e componentes do backoffice.
- `src/pages` - páginas públicas e administrativas.
- `src/routes` - definição central de rotas.
- `src/styles` - estilos globais, do catálogo e do admin.
- `supabase` - SQL de schema, RPC, seed e admin/RLS.

## Setup

1. Crie um projeto no Supabase.
2. Execute os arquivos SQL nesta ordem:
   - `supabase/schema.sql`
   - `supabase/rpc.sql`
   - `supabase/admin.sql`
   - `supabase/seed.sql`
3. Copie `.env.example` para `.env.local` e defina:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Instale dependências e rode a aplicação:

```bash
npm install
npm run dev
```

## Rotas

- `/` - catálogo público.
- `/admin` - redireciona para login administrativo.
- `/admin/login` - login do admin.
- `/admin/dashboard` - dashboard administrativo.
- `/admin/establishments` - listagem de estabelecimentos.
- `/admin/establishments/new` - criação de estabelecimento.
- `/admin/establishments/:id` - edição de estabelecimento.
- `/admin/categories` - gestão de categorias.
- `/admin/accesses` - ranking mensal de acessos.

## Variáveis de ambiente

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Comandos

- `npm run dev` - ambiente local.
- `npm run build` - build de produção.
- `npm run lint` - lint do projeto.

## Observações

- O catálogo não usa fallback mockado; se o Supabase não responder, a tela mostra erro.
- O auth do Supabase usa sessionStorage para isolar a sessão por aba.
- O admin exige login ao acessar `/admin`.
- Os acessos mensais são incrementados via RPC atômica no Supabase.
