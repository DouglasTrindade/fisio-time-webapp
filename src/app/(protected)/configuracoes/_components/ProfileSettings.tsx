"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { ImageInput } from "@/components/ui/image-input"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useRecord, useUpdateRecord } from "@/hooks/useRecord"
import type { UserProfile } from "@/types/user"
import { Eye, EyeOff } from "lucide-react"

import { userSettingsSchema, type UserSettingsValues } from "./schema"

export const ProfileSettings = () => {
  const { data: user, isLoading } = useRecord<UserProfile>("/users", "me")
  const updateUser = useUpdateRecord<UserProfile, UserSettingsValues>("/users")
  const form = useForm<UserSettingsValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: "",
      email: "",
      image: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }, [user, form])

  const handleSubmit = async (values: UserSettingsValues) => {
    const hasPasswordChange = Boolean(values.newPassword?.trim())
    await updateUser.mutateAsync({
      id: "me",
      data: {
        name: values.name,
        email: values.email,
        image: values.image?.trim() ? values.image : undefined,
        currentPassword: hasPasswordChange ? values.currentPassword : undefined,
        newPassword: hasPasswordChange ? values.newPassword : undefined,
      },
    })
    form.reset({
      name: values.name,
      email: values.email,
      image: values.image ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  return (
    <Card className="border-border/70 bg-card/85 shadow-lg">
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Personalize a identidade da sua conta.</CardDescription>
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
                        onChange={(url) => form.setValue("image", url, { shouldDirty: false })}
                        helperText="PNG ou JPG com até 5MB"
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

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha atual</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Informe sua senha atual" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Crie uma nova senha"
                            {...field}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Confirmar nova senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Repita a nova senha"
                            {...field}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
