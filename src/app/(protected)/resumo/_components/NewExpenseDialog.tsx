"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { apiRequest } from "@/services/api"
import { handleApiError } from "@/services/handleApiError"

const expenseSchema = z.object({
  description: z.string().min(2, "Informe uma descrição"),
  amount: z.string().min(1, "Informe o valor"),
  account: z.string().min(1, "Informe a conta"),
  expenseCategory: z.string().min(1, "Selecione ou crie uma categoria"),
  paymentMethod: z.enum(["credit_card", "pix", "bank_slip"]),
  dueDate: z.string().min(1, "Selecione uma data"),
  competenceDate: z.string().min(1, "Selecione uma data"),
  isPaid: z.boolean(),
  notes: z.string().optional(),
  kind: z.literal("expense"),
})

type NewExpenseValues = z.infer<typeof expenseSchema>

const defaultCategories = ["Infraestrutura", "Operacional", "Marketing"]
const categoriesStorageKey = "finance-expense-categories"

export const NewExpenseDialog = () => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState(defaultCategories)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const router = useRouter()
  const form = useForm<NewExpenseValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      account: "",
      expenseCategory: "",
      paymentMethod: "pix",
      dueDate: "",
      competenceDate: "",
      isPaid: false,
      notes: "",
      kind: "expense",
    },
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(categoriesStorageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
          setCategories(parsed)
        }
      } catch {
        // Ignore invalid storage
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(categoriesStorageKey, JSON.stringify(categories))
  }, [categories])

  const handleAddCategory = () => {
    const value = newCategoryName.trim()
    if (!value) {
      toast.error("Informe o nome da categoria")
      return
    }

    if (!categories.includes(value)) {
      setCategories((prev) => [...prev, value])
    }

    form.setValue("expenseCategory", value, { shouldValidate: true })
    setNewCategoryName("")
    setIsCategoryDialogOpen(false)
  }

  const handleSubmit = async (values: NewExpenseValues) => {
    try {
      setIsSubmitting(true)
      await apiRequest("/transactions", {
        method: "POST",
        data: values,
      })
      toast.success("Despesa cadastrada!", {
        description: `${values.description} - R$ ${values.amount}`,
      })
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      handleApiError(error, "Não foi possível salvar a despesa")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Nova despesa</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova despesa</DialogTitle>
          <DialogDescription>Registre gastos operacionais e acompanhe o impacto financeiro.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Aluguel da clínica" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta</FormLabel>
                    <FormControl>
                      <Input placeholder="Conta corrente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expenseCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Popover open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="icon" aria-label="Adicionar categoria">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 space-y-3">
                        <div>
                          <h4 className="text-sm font-medium">Nova categoria</h4>
                          <p className="text-xs text-muted-foreground">Organize melhor seus gastos.</p>
                        </div>
                        <Input
                          placeholder="Ex: Aluguel"
                          value={newCategoryName}
                          onChange={(event) => setNewCategoryName(event.target.value)}
                        />
                        <Button type="button" size="sm" className="w-full" onClick={handleAddCategory}>
                          Adicionar
                        </Button>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de pagamento</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="credit_card">Cartão de crédito</SelectItem>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="bank_slip">Boleto bancário</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de vencimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="competenceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de competência</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPaid"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border border-border/70 p-3">
                  <div>
                    <FormLabel>Despesa paga?</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Informe se o pagamento já foi compensado.
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informações adicionais</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações ou detalhes relevantes" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar despesa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
