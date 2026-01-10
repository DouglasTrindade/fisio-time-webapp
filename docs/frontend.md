# Frontend Guide

## Stack

- **Next.js 16 (App Router)** com suporte a Server Components e layouts aninhados.
- **TypeScript** em todo o código.
- **Tailwind CSS 4 + shadcn/ui** para UI reusável (Radix + componentes próprios em `src/components/ui`).
- **React Query (TanStack)** para cache/state remoto.
- **React Hook Form + Zod** para formulários validados no cliente.
- **FullCalendar** nos módulos de agendamentos.
- **Recharts** para dashboards e relatórios (abstraídos pelos wrappers em `src/components/ui/chart`).
- **Next Themes** para alternância de tema claro/escuro.

## Estrutura de diretórios

```
src/
├─ app/
│  ├─ (auth)/               # telas públicas (login etc.)
│  ├─ (protected)/          # layout autenticado, dividido por domínio (pacientes, atendimentos...)
│  └─ api/                  # rotas da API (ver backend.md)
├─ components/
│  ├─ ui/                   # biblioteca shadcn customizada
│  └─ ...                   # componentes específicos (ClientOnly, Sidebar, etc.)
├─ contexts/                # providers/crud factories para cada módulo
├─ hooks/                   # hooks de dados (useRecords, useRecord...)
└─ lib/                     # utilitários (prisma client, supabase, etc.)
```

### Layouts

- `src/app/(protected)/layout.tsx` controla autenticação, sidebar e cabeçalhos.
- Sub-rotas podem definir layouts próprios para controlar breadcrumbs ou filtros.

### Componentização de CRUDs

1. Defina `config.ts` dentro de `src/app/(protected)/<modulo>/_components/` com `endpoint` e `defaultFilters`.
2. Crie um contexto com `createCrudContext` para expor `records`, `pagination`, `handleCreate/Update/Delete` e estado de filtros.
3. Consuma o contexto nos componentes do módulo (listas, filtros, modais).

Esse padrão mantém cada domínio isolado e garante consistência entre telas (especialmente paginações e ordenações).

### Hooks principais

| Hook | O que faz |
| --- | --- |
| `useRecords(endpoint, query, options)` | GET paginado (usa `apiRequest`, aplica cache e retorna `records` + `pagination`). |
| `useRecord(endpoint, id)` | GET de um único registro (habilitado somente com `id`). |
| `useCreateRecord`, `useUpdateRecord`, `useDeleteRecord` | Mutations padronizadas com invalidation automática e toasts via `sonner`. |

Todos os hooks começam com `use client`, portanto devem ser usados apenas em Client Components (qualquer arquivo que interaja com o DOM/estado).

### UI e estilos

- Novos componentes visuais devem ser adicionados em `src/components/ui` reutilizando tokens do shadcn.
- Comentários CSS utilzam tailwind/tokens (por exemplo, `bg-linear-to-b from-white/5`).
- Para gráficos, use os wrappers do shadcn (`ChartContainer`, `ChartTooltipContent`, etc.) e mantenha as configurações dentro do módulo (ex.: `src/app/(protected)/relatorios/...`).

### Formulários

- Cada modal/form possui um schema no diretório `Fields/schema.ts` e consome esse schema no `react-hook-form` via `zodResolver`.
- Campos compartilhados (inputs, selects, máscaras) ficam em `src/components/ui`.

### Navegação e Sidebar

- `src/app/(protected)/App/sidebar.config.ts` descreve os grupos/menus do sidebar. Cada item aceita `slug`, `title`, `url`, `icon` e `disabled`.
- `SidebarNavigation.tsx` renderiza o menu, utilizando componentes do `ui/sidebar`.
- Estados de submenu utilizam `Collapsible` com animações configuradas via CSS transitions.

### Autenticação e ClientOnly

- Rotas protegidas usam layouts assíncronos com `auth()` do NextAuth. Componentes que precisam forçar execução apenas no cliente importam `ClientOnly`.

### Exportação e tabelas

- Listagens usam `@tanstack/react-table`.
- Exportações (CSV/XLSX) aproveitam `json-as-xlsx`.
- Use `exportColumns` em cada módulo para declarar colunas exportáveis.

### Boas práticas

- Sempre prefira Server Components para páginas de listagem/detalhe que podem ser renderizadas no servidor. Use Client Components somente onde há interatividade.
- Evite duplicar estados: filtros globais pertencem ao contexto do módulo. Componentes específicos recebem callbacks (`handleSearch`, `handlePageChange`).
- Para requisições dinâmicas (ex.: rota `[id]`), componha a URL em cima do `endpoint` do config: ``${patientsCrudConfig.endpoint}/${id}``.

## Fluxo de desenvolvimento

1. **Criar/atualizar schema Prisma** -> migrações.
2. **Atualizar rotas de API** (servidor) e tipagens em `src/app/types`.
3. **Atualizar config + contexto** do módulo.
4. **Criar UI/fluxos** em `src/app/(protected)/...`.
5. **Adicionar testes manuais** e validar no navegador.

## Diagnóstico e performance

- Use React Query Devtools (habilitável localmente) para inspecionar cache.
- Ajuste `staleTime`/`enabled` nos hooks quando um módulo precisar polir revalidações.
- Prefira `Suspense` e `loading.tsx` para estados esqueléticos (pasta App Router).

## Recursos adicionais

- [shadcn/ui Docs](https://ui.shadcn.com/)
- [FullCalendar React Docs](https://fullcalendar.io/docs/react)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
