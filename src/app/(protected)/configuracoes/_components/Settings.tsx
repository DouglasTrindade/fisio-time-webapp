"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  UserRound,
  ShieldCheck,
  CreditCard,
  BellRing,
  PencilLine,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ImageInput } from "@/components/ui/image-input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

import { useRecord, useUpdateRecord } from "@/hooks/useRecord"
import type { UserProfile } from "@/types/user"
import { userSettingsSchema, type UserSettingsValues } from "./schema"

type SettingsSection = "profile" | "account" | "billing" | "notifications"

const sections: Array<{
  id: SettingsSection
  label: string
  description: string
  icon: typeof UserRound
}> = [
    { id: "profile", label: "Perfil", description: "Informações públicas e avatar.", icon: UserRound },
    { id: "account", label: "Conta", description: "Preferências da conta.", icon: ShieldCheck },
    { id: "billing", label: "Cobrança", description: "Planos e pagamentos.", icon: CreditCard },
    { id: "notifications", label: "Notificações", description: "Alertas e e-mails.", icon: BellRing },
  ]

export const Settings = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")

  const renderSection = useMemo(() => {
    switch (activeSection) {
      case "account":
        return <AccountSettings />
      case "billing":
        return <BillingSettings />
      case "notifications":
        return <NotificationsSettings />
      case "profile":
      default:
        return <ProfileSettings />
    }
  }, [activeSection])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie preferências da conta, formas de pagamento e notificações.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="border-border/70 bg-card/80 shadow-lg">
          <nav className="flex flex-col">
            {sections.map((section, index) => {
              const isActive = section.id === activeSection
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-left transition",
                    "border-b border-border/60 last:border-b-0",
                    isActive
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border",
                      isActive ? "border-primary/40 bg-primary/10 text-primary" : "border-border/60",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span>{section.label}</span>
                    <span className="text-xs text-muted-foreground">{section.description}</span>
                  </div>
                </button>
              )
            })}
          </nav>
        </Card>

        <div>{renderSection}</div>
      </div>
    </div>
  )
}

const ProfileSettings = () => {
  const { data: user, isLoading } = useRecord<UserProfile>("/users", "me")
  const updateUser = useUpdateRecord<UserProfile, UserSettingsValues>("/users")
  const form = useForm<UserSettingsValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      image: "",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? "",
      })
    }
  }, [user, form])

  const handleSubmit = async (values: UserSettingsValues) => {
    await updateUser.mutateAsync({
      id: "me",
      data: {
        ...values,
        image: values.image?.trim() ? values.image : undefined,
      },
    })
    form.reset(values)
  }

  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Personalize sua identidade e contatos.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem</FormLabel>
                    <FormControl>
                      <ImageInput
                        value={field.value}
                        onChange={(url) => {
                          form.setValue("image", url, { shouldDirty: false })
                        }}
                        helperText="PNG ou JPG com até 5MB."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nome@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={updateUser.isPending || !form.formState.isDirty}>
                  {updateUser.isPending ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
}

const AccountSettings = () => {
  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <CardTitle>Conta</CardTitle>
        <CardDescription>Atualize dados privados da sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="grid gap-3">
            <label className="text-sm font-medium">Nome</label>
            <Input placeholder="Seu nome" />
            <p className="text-xs text-muted-foreground">Nome exibido em perfis e notificações.</p>
          </div>
          <div className="grid gap-3">
            <label className="text-sm font-medium">Data de nascimento</label>
            <Input type="date" />
          </div>
          <div className="grid gap-3">
            <label className="text-sm font-medium">Idioma</label>
            <Select defaultValue="pt-BR">
              <SelectTrigger>
                <SelectValue placeholder="Selecione um idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">Inglês (EUA)</SelectItem>
                <SelectItem value="es-ES">Espanhol</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Idioma utilizado nos e-mails e no painel.
            </p>
          </div>
          <div className="flex justify-end pt-2">
            <Button>Atualizar conta</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const paymentMethods = [
  { id: "0392", brand: "Mastercard", label: "Primário", expires: "12/2025" },
  { id: "8461", brand: "Visa", label: null, expires: "06/2025" },
]

const transactions = [
  { reference: "#36223", product: "Plano premium", status: "pendente", date: "12/10/2025", amount: "$39,90" },
  { reference: "#34283", product: "Assinatura enterprise", status: "pago", date: "11/13/2025", amount: "$159,90" },
  { reference: "#32234", product: "Licença business", status: "pago", date: "10/13/2025", amount: "$89,90" },
  { reference: "#31354", product: "Integração customizada", status: "falhou", date: "09/13/2025", amount: "$299,90" },
]

const BillingSettings = () => {
  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/85 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Cobrança</CardTitle>
            <CardDescription>Plano mensal • Próxima cobrança em 02/09/2025</CardDescription>
          </div>
          <Button variant="outline">Alterar plano</Button>
        </CardHeader>
      </Card>

      <Card className="border-border/70 bg-card/85 shadow-lg">
        <CardHeader>
          <CardTitle>Métodos de pagamento</CardTitle>
          <CardDescription>Gerencie cartões utilizados nas cobranças.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between rounded-xl border border-border/80 bg-background/60 p-4"
            >
              <div>
                <p className="font-medium">{method.brand} •••• {method.id}</p>
                <p className="text-xs text-muted-foreground">Expira {method.expires}</p>
                {method.label ? (
                  <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                    {method.label}
                  </span>
                ) : null}
              </div>
              <Button variant="ghost" size="icon">
                <PencilLine className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" className="w-full">+ Adicionar método de pagamento</Button>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/85 shadow-lg">
        <CardHeader>
          <CardTitle>Histórico de transações</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referência</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.reference}>
                  <TableCell className="font-medium">{transaction.reference}</TableCell>
                  <TableCell>{transaction.product}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs capitalize",
                        transaction.status === "pago" && "bg-emerald-500/10 text-emerald-400",
                        transaction.status === "pendente" && "bg-amber-500/10 text-amber-400",
                        transaction.status === "falhou" && "bg-rose-500/10 text-rose-400",
                      )}
                    >
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="text-right font-medium">{transaction.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

const NotificationsSettings = () => {
  const [preference, setPreference] = useState("all")
  const [emailPreferences, setEmailPreferences] = useState({
    communication: true,
    marketing: false,
    social: true,
    security: false,
  })

  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>Escolha o que deseja receber por e-mail.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium">Notifique-me sobre...</p>
          <RadioGroup
            value={preference}
            onValueChange={setPreference}
            className="mt-3 space-y-3"
          >
            {[
              { value: "all", title: "Todas as novas mensagens" },
              { value: "direct", title: "Mensagens diretas e menções" },
              { value: "none", title: "Nada" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 p-3"
              >
                <RadioGroupItem value={option.value} />
                <span className="text-sm font-medium">{option.title}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-3">
          {[
            { key: "communication", title: "E-mails de comunicação", description: "Atividades importantes da conta." },
            { key: "marketing", title: "E-mails de marketing", description: "Novidades sobre produtos e planos." },
            { key: "social", title: "E-mails sociais", description: "Convites, menções e solicitações." },
            { key: "security", title: "E-mails de segurança", description: "Alertas de login e dispositivos." },
          ].map((item) => (
            <div
              key={item.key}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 p-4"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={emailPreferences[item.key as keyof typeof emailPreferences]}
                onCheckedChange={(checked) =>
                  setEmailPreferences((prev) => ({
                    ...prev,
                    [item.key]: checked,
                  }))
                }
              />
            </div>
          ))}
        </div>

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="mt-1 h-4 w-4 rounded border-border bg-background" />
          Usar configurações diferentes para meus dispositivos móveis.
        </label>

        <div className="flex justify-end">
          <Button>Atualizar notificações</Button>
        </div>
      </CardContent>
    </Card>
  )
}
