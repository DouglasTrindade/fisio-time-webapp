"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Search } from "lucide-react"

import { Form, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

interface AttendancesFiltersProps {
  search: string
  sortValue: string
  onSearch: (value: string) => void
  onSortChange: (value: string) => void
}

type FiltersFormValues = {
  search: string
  sort: string
}

export const AttendancesFilters = ({
  search,
  sortValue,
  onSearch,
  onSortChange,
}: AttendancesFiltersProps) => {
  const form = useForm<FiltersFormValues>({
    defaultValues: {
      search,
      sort: sortValue,
    },
  })

  useEffect(() => {
    form.reset({ search, sort: sortValue })
  }, [form, search, sortValue])

  const watchedSearch = form.watch("search")
  const watchedSort = form.watch("sort")
  const debouncedSearch = useDebouncedValue(watchedSearch, 300)

  useEffect(() => {
    if (debouncedSearch === search) return
    onSearch(debouncedSearch)
  }, [debouncedSearch, onSearch, search])

  useEffect(() => {
    if (!watchedSort || watchedSort === sortValue) return
    onSortChange(watchedSort)
  }, [watchedSort, onSortChange, sortValue])

  return (
    <Form {...form}>
      <form className="flex items-center gap-4" onSubmit={(event) => event.preventDefault()}>
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <FormControl>
            <Input
              className="pl-10"
              placeholder="Buscar paciente ou profissional..."
              {...form.register("search")}
            />
          </FormControl>
        </div>
        <Select
          value={watchedSort}
          onValueChange={(value) => form.setValue("sort", value, { shouldDirty: true })}
        >
          <SelectTrigger className="w-full md:w-56">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Data mais recente</SelectItem>
            <SelectItem value="date-asc">Data mais antiga</SelectItem>
            <SelectItem value="createdAt-desc">Criados recentemente</SelectItem>
            <SelectItem value="createdAt-asc">Criados há mais tempo</SelectItem>
            <SelectItem value="type-asc">Tipo (A-Z)</SelectItem>
            <SelectItem value="type-desc">Tipo (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </form>
    </Form>
  )
}
