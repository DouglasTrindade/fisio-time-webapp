# Backend Guide

## Stack

- **Next.js Route Handlers** (`src/app/api/**/route.ts`) atuando como camada de API REST.
- **Prisma ORM** (com `@prisma/adapter-pg`) conectado a PostgreSQL.
- **NextAuth** para autenticação (Credenciais + GitHub OAuth) com sessões JWT.
- **Zod** para validação de payloads.
- **Axios** no cliente (via `apiRequest`) apontando para `/api/*`.

## Estrutura

```
src/app/api/
├─ patients/
│  ├─ route.ts          # GET/POST
│  └─ [id]/route.ts     # GET/PUT/DELETE
├─ attendances/
├─ appointments/
├─ treatment-plans/
├─ reports/attendances/{patients|professionals|cities}/route.ts
├─ users/me/route.ts
├─ cids/, cifs/         # listas auxiliares
└─ ...                  # novos módulos seguem o mesmo padrão
```

Cada arquivo exporta `GET`, `POST`, `PUT`, `DELETE` etc. e retorna `NextResponse<ApiResponse<T>>`. Utilitários em `src/lib/api/utils.ts` padronizam responses, erros e paginação.

## Fluxo padrão da API

1. **Validação**: `validateJsonBody(request, schema)` + schemas zod específicos da rota (ex.: `src/app/api/patients/schema.ts`).
2. **Paginação**: `getPaginationParams` extrai `page`, `limit`, `search`, `sortBy`, `sortOrder`.
3. **Acesso a dados**: Prisma Client através de `import { prisma } from "@/lib/prisma"`.
4. **Resposta**: `createApiResponse(data, message)` em caso de sucesso; `createApiError` + `handleApiError` em exceções.
5. **Status HTTP**: 2xx para sucesso (201 em POST), 4xx para erros de entrada e 5xx para falhas internas.

## Autenticação

- Configurada em `src/auth.ts` com adaptador Prisma.
- Providers: GitHub + Credenciais (login por e-mail/senha).
- Variáveis necessárias: `NEXTAUTH_SECRET`, `GITHUB_ID`, `GITHUB_SECRET`, além de `NEXTAUTH_URL` durante deploy.
- Sessões JWT guardam `token.id` para identificar o usuário autenticado.
- `auth()` pode ser usado em Server Components para proteger rotas; handlers em `/api` podem checar `const session = await auth()` se necessário.

## Banco de dados

- Schemas definidos em `prisma/schema.prisma`.
- Migrations e seeds ficam em `prisma/migrations` e `prisma/seed.ts`.
- Utilize os scripts:
  - `npm run db:migrate` – aplica migrações (dev).
  - `npm run db:generate` – gera Prisma Client.
  - `npm run db:seed` – executa `tsx prisma/seed.ts`.
  - `npm run db:reset` – reseta banco.
- `DATABASE_URL` deve apontar para o banco principal; `DIRECT_URL` opcional para operações administrativas.

## Respostas e tipos

- Interface genérica `ApiResponse<T>` (`src/lib/api/types.ts`):
  ```ts
  {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  ```
- Listagens usam `RecordsResponse<T>` (em `src/app/types/api.ts`), sempre retornando `{ records, pagination }`.
- Erros consistentes (`message`, `status`, `code`) podem ser lançados via `ApiErrorClass`.

## Boas práticas para novas rotas

1. Crie uma pasta em `src/app/api/<recurso>` e, se necessário, subpastas `[id]`.
2. Extraia schemas `schema.ts` na mesma pasta para manter validações coesas.
3. Use `handleApiError` em todos os blocos `catch`.
4. Não exponha campos sensíveis: selecione explicitamente as colunas Prisma.
5. Padronize limites de paginação (`limit <= 100`).
6. Sempre sanitize ordenação (`validSortFields.includes(sortBy)`).

## Integrações externas

- **Supabase**: `src/lib/supabase.ts` cria `supabaseAdmin` quando `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` estão definidos. Caso contrário, um warning é exibido e a integração é ignorada.
- **FullCalendar/Reports**: backend fornece endpoints agregados (`/api/reports/attendances/**`) consumidos pelos gráficos do frontend.

## Ferramentas auxiliares

- `src/proxy.ts` intercepta chamadas em dev (quando necessário) para tratar cabeçalhos/cookies.
- `src/actions/**`: server actions específicas (ex.: importações ou jobs) podem ficar aqui para manter API enxuta.

## Check-list antes de subir uma mudança

1. Rodar `npm run lint`.
2. Rodar `npm run db:migrate` caso o schema tenha mudado.
3. Atualizar `docs/` se houver novas rotas, variáveis ou decisões arquiteturais.
4. Validar manualmente as rotas afetadas (utilize o `apiRequest` no frontend ou ferramentas como Thunder Client).
