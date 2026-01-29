"use client"

import { useMemo, useState } from "react"
import { Check, Crown, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SubscriptionPlan } from "@/types/billing"
import { CheckoutDialog } from "./_components/CheckoutDialog"

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const billingCycles = [
  {
    slug: "monthly",
    label: "Mensal",
    helper: "Flexibilidade total",
    multiplier: 1,
    caption: "/mês · cobrança mensal",
  },
  {
    slug: "semiannual",
    label: "Semestral",
    helper: "Economize 10%",
    multiplier: 0.9,
    caption: "/mês · faturado a cada 6 meses",
  },
  {
    slug: "annual",
    label: "Anual",
    helper: "2 meses grátis",
    multiplier: 0.83,
    caption: "/mês · faturado anualmente",
  },
] as const

const plans: SubscriptionPlan[] = [
  {
    id: "professional",
    name: "Profissional",
    description: "Perfeito para quem atende sozinho ou em home care.",
    price: 129,
    badge: "Comece certo",
    highlight: false,
    limits: [
      "1.000 pacientes ativos",
      "1.200 atendimentos/agendamentos por mês",
      "1 profissional + 2 usuários administrativos",
      "1 unidade física",
    ],
    features: [
      "Prontuário eletrônico completo",
      "Modelos de evolução e avaliação",
      "Agenda com confirmação via WhatsApp",
      "Lembretes automáticos e check-in rápido",
      "Exportação financeira básica em CSV",
    ],
    addOns: [
      "SMS adicional: R$ 0,19 por disparo",
      "Automação de marketing: R$ 39/mês",
    ],
  },
  {
    id: "team",
    name: "Equipe",
    description: "Mais fôlego para equipes multidisciplinares.",
    price: 219,
    badge: "Mais utilizado",
    highlight: true,
    limits: [
      "5.000 pacientes ativos",
      "5.000 atendimentos/agendamentos por mês",
      "Até 6 profissionais + usuários administrativos ilimitados",
      "Até 3 unidades físicas",
    ],
    features: [
      "Dashboard financeiro com receitas x despesas",
      "Workflows para planos de tratamento",
      "Templates compartilhados entre a equipe",
      "Integração com relatórios e exportações contábeis",
      "Suporte prioritário via chat e e-mail",
    ],
    addOns: [
      "Campanhas de WhatsApp: R$ 59/mês",
      "Integração contábil avançada: R$ 79/mês",
    ],
  },
  {
    id: "clinic",
    name: "Clínica",
    description: "Para redes e clínicas com alto volume.",
    price: 449,
    badge: "Escala",
    highlight: false,
    limits: [
      "15.000 pacientes ativos",
      "15.000 atendimentos/agendamentos por mês",
      "Até 20 profissionais + administrativos ilimitados",
      "Unidades ilimitadas sob a mesma operação",
    ],
    features: [
      "Controle financeiro avançado com DRE e centros de custo",
      "Permissões customizadas e trilha de auditoria",
      "Fila inteligente de atendimentos e salas",
      "API para integrações externas",
      "Suporte dedicado com gerente de sucesso",
    ],
    addOns: [
      "Onboarding in loco: sob consulta",
      "Mensageria transacional em larga escala",
    ],
  },
] as const

export default function UpgradePage() {
  const [cycle, setCycle] = useState<(typeof billingCycles)[number]>(billingCycles[0])
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const cycleOptions = useMemo(() => billingCycles, [])
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setCheckoutOpen(true)
  }

  return (
    <section className="space-y-10">
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Assinar um plano
        </div>
        <h1 className="text-3xl font-semibold">Planos pensados para clínicas em crescimento</h1>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          Escolha o plano que acompanha o momento da sua operação. Você pode migrar a qualquer momento e mantém todos os dados e históricos.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {cycleOptions.map((option) => {
          const isActive = option.slug === cycle.slug
          return (
            <button
              key={option.slug}
              type="button"
              onClick={() => setCycle(option)}
              className={cn(
                "flex min-w-[180px] flex-col rounded-xl border px-4 py-3 text-left transition",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/70 text-muted-foreground hover:border-primary/60 hover:text-foreground",
              )}
            >
              <span className="font-semibold">{option.label}</span>
              <span className="text-sm">{option.helper}</span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = plan.price * cycle.multiplier
          return (
            <Card
              key={plan.id}
              className={cn(
                "flex h-full flex-col border-2",
                plan.highlight ? "border-primary shadow-lg shadow-primary/20" : "border-border/70",
              )}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span>{plan.badge}</span>
                  {plan.highlight ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
                      <Crown className="h-3 w-3" />
                      Mais escolhido
                    </span>
                  ) : null}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div>
                  <div className="text-4xl font-semibold text-foreground">
                    {currency.format(price)}
                  </div>
                  <p className="text-sm text-muted-foreground">{cycle.caption}</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <div className="space-y-2 text-sm">
                  {plan.limits.map((limit) => (
                    <p key={limit} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{limit}</span>
                    </p>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    O que está incluído
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pacotes adicionais
                  </p>
                  <ul className="space-y-1 text-muted-foreground">
                    {plan.addOns.map((addOn) => (
                      <li key={addOn} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 text-primary/70" />
                        <span>{addOn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.highlight ? "default" : "outline"} onClick={() => handleSelectPlan(plan)}>
                  Quero este plano
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/60 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Precisa de algo personalizado? <span className="font-medium text-foreground">Fale com nosso time comercial</span> e montamos um plano com volume de mensagens, unidades adicionais ou integrações específicas.
        </p>
      </div>
      <CheckoutDialog plan={selectedPlan} open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </section>
  )
}
