import { auth } from "@/auth"

import { Users } from "./_components"

export default async function UsersPage() {
  const session = await auth()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Usuários</h1>
        <p className="text-muted-foreground">
          Convide membros e acompanhe quem possui acesso ao sistema.
        </p>
      </div>

      <Users currentRole={session?.user?.role} />
    </section>
  )
}
