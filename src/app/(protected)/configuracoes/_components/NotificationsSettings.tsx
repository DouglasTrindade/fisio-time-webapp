"use client"

import { useEffect, useState } from "react"
import { BellRing } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { apiRequest } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import { toast } from "sonner"
import { getApiErrorMessage } from "@/services/api/error"

export const NotificationsSettings = () => {
  const [preference, setPreference] = useState("all")
  const [emailPreferences, setEmailPreferences] = useState({
    communication: true,
    marketing: false,
    social: true,
    security: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const response = await apiRequest<ApiResponse<{
          preference: "all" | "direct" | "none"
          emailCommunication: boolean
          emailMarketing: boolean
          emailSocial: boolean
          emailSecurity: boolean
        }>>("/notification-settings")
        const data = response.data
        if (data) {
          setPreference(data.preference)
          setEmailPreferences({
            communication: data.emailCommunication,
            marketing: data.emailMarketing,
            social: data.emailSocial,
            security: data.emailSecurity,
          })
        }
      } catch (error) {
        console.error(error)
        toast.error(getApiErrorMessage(error, "Não foi possível carregar as configurações"))
      } finally {
        setIsLoading(false)
      }
    }

    void fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await apiRequest<ApiResponse<unknown>>("/notification-settings", {
        method: "PUT",
        data: {
          preference,
          emailCommunication: emailPreferences.communication,
          emailMarketing: emailPreferences.marketing,
          emailSocial: emailPreferences.social,
          emailSecurity: emailPreferences.security,
        },
      })
      toast.success("Configurações atualizadas")
    } catch (error) {
      console.error(error)
      toast.error(getApiErrorMessage(error, "Não foi possível salvar as configurações"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BellRing className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Escolha o que deseja receber por e-mail.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium">Notifique-me sobre...</p>
          <RadioGroup value={preference} onValueChange={setPreference} className="mt-3 space-y-3">
            {[{ value: "all", title: "Todas as novas mensagens" }, { value: "direct", title: "Mensagens diretas e menções" }, { value: "none", title: "Nada" }].map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 p-3">
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
            <div key={item.key} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
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
          <Button onClick={handleSave} disabled={isLoading || isSaving}>
            {isSaving ? "Salvando..." : "Atualizar notificações"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
