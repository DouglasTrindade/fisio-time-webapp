import { Sparkles } from "lucide-react"
import { Button } from "./button"
import Link from "next/link"

export const UpgradeCard = () => {
  return (
    <div className="mt-auto py-4">
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background to-background p-4 shadow-inner">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-primary/20 p-2 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">Faça um upgrade</p>
            <p className="text-xs text-muted-foreground">
              Automação financeira, notificações inteligentes e relatórios avançados.
            </p>
          </div>
        </div>
        <Button asChild className="mt-4 w-full" size="sm">
          <Link href="/upgrade">Fazer upgrade</Link>
        </Button>
      </div>
    </div>
  )
}