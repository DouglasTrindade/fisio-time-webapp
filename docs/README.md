# Documentação do Projeto

Este diretório reúne a documentação viva do produto **Fisio Time**. Aqui estão descritos os fluxos de trabalho, decisões arquiteturais e guias operacionais tanto para o frontend quanto para o backend.

## Estrutura

- `frontend.md`: arquitetura da aplicação Next.js, bibliotecas de UI, gestão de estado e fluxos de dados.
- `backend.md`: APIs, camadas de acesso a dados (Prisma), autenticação e tarefas de infraestrutura.

## Como usar

1. **Onboarding rápido** – leia este arquivo e, em seguida, os documentos específicos (frontend/backend) para entender o ecossistema.
2. **Atualizações** – sempre que um novo módulo for criado ou uma decisão arquitetural significativa for tomada, adicione a informação relevante nesta pasta (preferencialmente com uma nova seção ou arquivo).
3. **Revisão** – sugira melhorias via PR para manter a documentação alinhada ao código.

## Comandos essenciais

```bash
# Instalação de dependências
npm install

# Ambiente local (executa prisma generate + next dev)
npm run dev

# Build de produção
npm run build && npm run start

# Lint
npm run lint

# Banco de dados (Prisma + PostgreSQL)
npm run db:generate  # gera client
npm run db:migrate   # aplica migrações locais
npm run db:seed      # executa seed (tsx prisma/seed.ts)
npm run db:studio    # abre Prisma Studio
```

## Variáveis de ambiente principais

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | Conexão com PostgreSQL usada pelo Prisma e NextAuth |
| `DIRECT_URL` | (opcional) URL direta para comandos do Prisma |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Configuração obrigatória para sessões NextAuth |
| `GITHUB_ID` / `GITHUB_SECRET` | Credenciais do provedor GitHub |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Apenas se funcionalidades que dependem do Supabase estiverem habilitadas |

> Consulte `.env.example` (quando disponível) ou a documentação interna de infraestrutura para valores específicos.

## Convenções gerais

- **App Router** do Next.js 16 com componentes de servidor e cliente.
- **React Query** gerencia cache de dados remotos. Hooks utilitários (`useRecords`, `useRecord`, `useCreateRecord`, etc.) encapsulam chamadas ao backend.
- **CRUD configs**: cada módulo em `src/app/(protected)/**/_components/config.ts` define `endpoint` e filtros padrão. Esses configs alimentam os contextos gerados por `createCrudContext`.
- **UI**: design tokens e componentes baseados no shadcn/ui (Radix + Tailwind). Novos componentes devem usar a pasta `src/components/ui`.

Para detalhes específicos, continue em [`frontend.md`](./frontend.md) e [`backend.md`](./backend.md).
