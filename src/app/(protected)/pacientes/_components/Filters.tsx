"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Form, FormControl } from "@/components/ui/form";

interface PatientsFiltersProps {
  search: string;
  onSearch: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
}

type FiltersFormValues = {
  search: string;
  sort: string;
}

export const PatientsFilters = ({
  search,
  onSearch,
  sortValue,
  onSortChange,
}: PatientsFiltersProps) => {
  const form = useForm<FiltersFormValues>({
    defaultValues: {
      search,
      sort: sortValue,
    },
  });

  useEffect(() => {
    form.reset({ search, sort: sortValue });
  }, [form, search, sortValue]);

  const watchedSearch = form.watch("search");
  const watchedSort = form.watch("sort");
  const debouncedSearch = useDebouncedValue(watchedSearch, 400);

  useEffect(() => {
    if (debouncedSearch === search) return;
    onSearch(debouncedSearch);
  }, [debouncedSearch, onSearch, search]);

  useEffect(() => {
    if (!watchedSort || watchedSort === sortValue) return;
    onSortChange(watchedSort);
  }, [watchedSort, onSortChange, sortValue]);

  return (
    <Form {...form}>
      <form className="flex items-center gap-4" onSubmit={(event) => event.preventDefault()}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <FormControl>
            <Input
              placeholder="Buscar pacientes..."
              className="pl-10"
              {...form.register("search")}
            />
          </FormControl>
        </div>

        <Select
          value={watchedSort}
          onValueChange={(value) => form.setValue("sort", value, { shouldDirty: true })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Nome (A-Z)</SelectItem>
            <SelectItem value="name-desc">Nome (Z-A)</SelectItem>
            <SelectItem value="createdAt-desc">Mais recentes</SelectItem>
            <SelectItem value="createdAt-asc">Mais antigos</SelectItem>
          </SelectContent>
        </Select>
      </form>
    </Form>
  );
};
