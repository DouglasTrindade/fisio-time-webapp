# Fisio Time

Aplicação web para clínicas de fisioterapia que centraliza cadastros de pacientes, agenda de atendimentos, relatórios analíticos e gestão financeira em um único painel. O projeto foi construído em **Next.js 16 (App Router)** com backend serverless (route handlers) e integrações com PostgreSQL/Prisma e NextAuth.

> Toda a documentação detalhada permanece em [`docs/`](./docs), mas este README resume o que é preciso para executar, contribuir e entender a arquitetura.

## 📚 Conteúdo

- [Principais módulos](#-principais-módulos)
- [Tecnologias & arquitetura](#-tecnologias--arquitetura)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Instalação & execução](#-instalação--execução)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Scripts úteis](#-scripts-úteis)
- [Fluxo de dados](#-fluxo-de-dados)
- [Autenticação & segurança](#-autenticação--segurança)
- [Boas práticas para contribuir](#-boas-práticas-para-contribuir)
- [Documentação complementar](#-documentação-complementar)

## 🧭 Principais módulos

| Módulo | Descrição | Rotas |
| --- | --- | --- |
| **Dashboard** | KPIs, cards e gráficos com visão geral de pacientes e atendimentos. | `/dashboard` |
| **Pacientes** | CRUD completo, filtros, exportação CSV/XLSX e histórico individual. | `/pacientes`, `/pacientes/[id]` |
| **Atendimentos** | Registro de avaliações/evoluções, anexos, integração financeira e relatórios. | `/atendimentos` |
| **Agendamentos** | Calendário (FullCalendar) com criação/edição rápida de compromissos. | `/agendamentos` |
| **Relatórios** | Dashboards por pacientes, profissionais e cidades usando gráficos shadcn/recharts. | `/relatorios/**` |
| **Notificações** | Envio de mensagens internas, emails programados e agrupamento por categoria. | `/notificacoes` |
| **Configurações** | Preferências gerais e cadastros auxiliares. | `/configuracoes` |

## 🧱 Tecnologias & arquitetura

- **Frontend**: Next.js 16 + React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Radix), TanStack React Query, React Hook Form + Zod.
- **Backend**: Next.js Route Handlers, Prisma ORM (PostgreSQL), NextAuth (JWT) com Prisma Adapter, rate limiting custom (`src/lib/rate-limit.ts`), Supabase opcional para uploads.
- **Infra/dev**: Turbopack (dev), Prisma Migrate, `json-as-xlsx`/`json-as-csv` carregados on-demand para exportações.

Arquitetura em camadas:

1. **App Router** divide rotas em `(auth)` e `(protected)` com layout autenticado.
2. **Contextos de CRUD** (`src/contexts/**`) expõem hooks `useRecords`, `useRecord`, `useCreateRecord` etc., mantendo filtros/paginação padronizados.
3. **API interna** (`src/app/api/**`) valida payloads com Zod, consulta o Prisma e retorna `ApiResponse<T>`.
4. **Libs de infraestrutura** (`src/lib/**`) cuidam de Prisma, Supabase, rate limit e utils de resposta.

## 📁 Estrutura de pastas

```
src/
├─ app/
│  ├─ (auth)/               # telas públicas (login, recuperação etc.)
│  ├─ (protected)/          # layout autenticado e domínios (pacientes, atendimentos...)
│  └─ api/                  # route handlers REST (+ schemas/validações)
├─ components/
│  ├─ ui/                   # biblioteca shadcn customizada
│  └─ ...                   # componentes compartilhados (Sidebar, ClientOnly, charts)
├─ contexts/                # createCrudContext + providers de UI
├─ hooks/                   # hooks de dados (React Query) e utilitários de exportação
├─ lib/                     # prisma, supabase, auth utils, rate-limit, api helpers
├─ types/                   # contratos compartilhados (Patient, Attendance, ApiResponse)
└─ docs/                    # documentação estendida (frontend/backend)
```

## ⚙️ Instalação & execução

### Pré-requisitos

- Node.js 20+
- PostgreSQL (local ou remoto)
- `npm` (ou outro gerenciador compatível)

### Passos

1. **Clone o repositório**
   ```bash
   git clone https://github.com/<org>/fisio-time.git
   cd fisio-time
   ```
2. **Instale dependências**
   ```bash
   npm install
   ```
3. **Configure variáveis** – copie `.env.example` para `.env.local` e ajuste valores (ver tabela abaixo).
4. **Gere Prisma Client e migrações**
   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed   # opcional
   ```
5. **Execute em desenvolvimento**
   ```bash
   npm run dev
   ```
6. **Build de produção**
   ```bash
   npm run build
   npm run start
   ```

## 🔐 Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Conexão principal com o PostgreSQL (necessário para NextAuth + Prisma). |
| `DIRECT_URL` | (Opcional) URL direta usada por comandos Prisma. |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Configuração de sessão NextAuth. |
| `GITHUB_ID` / `GITHUB_SECRET` | Provider OAuth opcional. |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Necessários se uploads/notificações via Supabase estiverem habilitados. |
| `RATE_LIMIT_*` | Parâmetros do limitador em `src/lib/rate-limit.ts` (padrão 120 req/min). |

> Consulte `.env.example` ou `docs/backend.md` para a lista completa.

## 🛠 Scripts úteis

| Script | Ação |
| --- | --- |
| `npm run dev` | Executa `prisma generate` e inicia `next dev --turbopack`. |
| `npm run build` | Build de produção (Next). |
| `npm run start` | Servidor em modo produção. |
| `npm run lint` | `next lint`. |
| `npm run db:generate` | Gera Prisma Client. |
| `npm run db:migrate` | Aplica migrações locais. |
| `npm run db:pull` | Atualiza schema a partir do banco existente. |
| `npm run db:seed` | Executa `tsx prisma/seed.ts`. |
| `npm run db:studio` | Abre Prisma Studio. |
| `npm run db:reset` | Recria banco (migrations + seed). |

## 🔁 Fluxo de dados

1. Componentes de lista consomem um contexto (`usePatientsContext`, `useAttendancesContext`, etc.).
2. Contextos usam `useRecords`/`useRecord` para chamar `/api/**` via `apiRequest` (Axios), com cache do React Query.
3. Mutations (`handleCreate`, `handleUpdate`, `handleDelete`) invalidam o cache automaticamente e exibem toasts (`sonner`).
4. Exportações CSV/XLSX são geradas client-side e bibliotecas pesadas são importadas dinamicamente para reduzir o bundle inicial.

## 🔒 Autenticação & segurança

- **NextAuth (JWT)** com Prisma Adapter. Login via credenciais próprias ou GitHub OAuth.
- Sessões expiram em 1 hora (`session.maxAge`). O callback invalida sessões expiradas automaticamente.
- **Rate limiting** aplicado em `src/proxy.ts` + `src/lib/rate-limit.ts`, limitando por IP (120 req/min por padrão) e retornando HTTP 429.
- Rotas sensíveis verificam `auth()` e filtram dados no Prisma (sem selecionar campos sensíveis por padrão).

## 🤝 Boas práticas para contribuir

1. **Antes de codar** – atualize sua branch com `main` e confirme migrações pendentes.
2. **Siga o padrão de módulos** – cada domínio possui `config.ts`, contexto e componentes em `src/app/(protected)/<domínio>/_components`.
3. **Validações com Zod** – crie schemas dedicados a cada rota em `src/app/api/<recurso>/schema.ts`.
4. **Documente** – alterações estruturais devem ser refletidas em `docs/frontend.md` ou `docs/backend.md`.
5. **Checklist**:
   - `npm run lint`
   - `npm run db:migrate` (se o schema mudou)
   - Testes manuais das telas afetadas
   - Atualização das migrações e seeds quando necessário

## 📖 Documentação complementar

- [`docs/frontend.md`](./docs/frontend.md) – padrões de UI, hooks, layouts e convenções do App Router.
- [`docs/backend.md`](./docs/backend.md) – detalhes de API, autenticação e banco de dados.
- [`docs/README.md`](./docs/README.md) – guia de como manter e evoluir a documentação.

---

Se tiver dúvidas ou quiser propor melhorias, abra uma issue/PR descrevendo o cenário. Bons commits! 💪
