import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-xl border-destructive/40 bg-background/95 text-center shadow-lg">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl font-bold">Acesso negado</CardTitle>
          <CardDescription className="text-base">
            Você não possui permissão para visualizar esta página. Caso ache
            que isso seja um engano, converse com um administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="default">
            <Link href="/dashboard">Voltar ao painel</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pacientes">Ir para pacientes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
