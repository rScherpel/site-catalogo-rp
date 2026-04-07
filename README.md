# Catálogo da Cidade

Aplicação web em React + Vite + TypeScript para catálogo local de estabelecimentos com busca, filtros, status calculado no frontend e persistência de acessos mensais via Supabase.

## Stack

- React
- Vite
- TypeScript
- Supabase
- CSS puro

## Estrutura

- `src/types` - tipos de domínio
- `src/utils` - funções puras de horário, busca, contato e catálogo
- `src/lib` - cliente Supabase
- `src/services` - acesso aos dados
- `src/hooks` - carregamento e atualização de catálogo
- `src/components/catalog` - componentes reutilizáveis da UI
- `src/pages` - página principal do catálogo
- `src/styles` - estilos globais e da aplicação
- `supabase` - SQL de schema, RPC e seed

## Setup

1. Crie um projeto no Supabase.
2. Execute os arquivos nesta ordem:
   - `supabase/schema.sql`
   - `supabase/rpc.sql`
   - `supabase/seed.sql`
3. Copie `.env.example` para `.env` e defina:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Instale dependências e rode a aplicação:

```bash
npm install
npm run dev
```

## Comandos

- `npm run dev` - ambiente local
- `npm run build` - build de produção
- `npm run lint` - lint do projeto

## Observações

- O status de aberto, fechado ou não informado é calculado no frontend com base nos horários estruturados.
- Os acessos mensais são incrementados via RPC atômica no Supabase quando houver configuração de ambiente.
- Sem variáveis do Supabase, a aplicação entra em modo de demonstração local para leitura e incrementos em `localStorage`.
