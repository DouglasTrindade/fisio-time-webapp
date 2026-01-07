"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type {
  TreatmentPlan,
  TreatmentPlanCreateInput,
  TreatmentPlanFilters,
  TreatmentPlanUpdateInput,
} from "@/app/types/treatment-plan";
import type { CrudContextValue } from "@/contexts/crud/types";
import { createCrudContext } from "@/contexts/crud/createCrudContext";
import { treatmentPlansCrudConfig } from "@/app/(protected)/tratamentos/_components/config";

type TreatmentPlansCrudValue = CrudContextValue<
  TreatmentPlan,
  TreatmentPlanCreateInput,
  TreatmentPlanUpdateInput,
  TreatmentPlanFilters
>;

interface TreatmentPlansContextValue extends TreatmentPlansCrudValue {
  isDialogOpen: boolean;
  editingPlanId: string | null;
  openNew: () => void;
  openEdit: (id: string) => void;
  closeDialog: () => void;
  handleSearch: (value: string) => void;
  handlePatientFilter: (patientId: string) => void;
  handleSortChange: (value: string) => void;
  handlePageChange: (page: number) => void;
}

const { CrudProvider, useCrud } = createCrudContext<
  TreatmentPlan,
  TreatmentPlanCreateInput,
  TreatmentPlanUpdateInput,
  TreatmentPlanFilters
>(treatmentPlansCrudConfig);

const TreatmentPlansContext = createContext<TreatmentPlansContextValue | null>(
  null
);

const TreatmentPlansProviderInner = ({ children }: { children: ReactNode }) => {
  const crud = useCrud();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const openNew = useCallback(() => {
    setEditingPlanId(null);
    setIsDialogOpen(true);
  }, []);

  const openEdit = useCallback((id: string) => {
    setEditingPlanId(id);
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingPlanId(null);
  }, []);

  const handleSearch = useCallback((value: string) => {
    crud.setFilters((previous) => ({
      ...previous,
      search: value,
      page: 1,
    }));
  }, [crud]);

  const handlePatientFilter = useCallback((patientId: string) => {
    crud.setFilters((previous) => ({
      ...previous,
      patientId,
      attendanceId: "",
      page: 1,
    }));
  }, [crud]);

  const handleSortChange = useCallback((value: string) => {
    const [field, order] = value.split("-");
    crud.setFilters((previous) => ({
      ...previous,
      sortBy: field as TreatmentPlanFilters["sortBy"],
      sortOrder: (order as "asc" | "desc") ?? "desc",
      page: 1,
    }));
  }, [crud]);

  const handlePageChange = useCallback((page: number) => {
    crud.setFilters((previous) => ({
      ...previous,
      page,
    }));
  }, [crud]);

  const value = useMemo(
    () => ({
      ...crud,
      isDialogOpen,
      editingPlanId,
      openNew,
      openEdit,
      closeDialog,
      handleSearch,
      handlePatientFilter,
      handleSortChange,
      handlePageChange,
    }),
    [
      crud,
      isDialogOpen,
      editingPlanId,
      openNew,
      openEdit,
      closeDialog,
      handleSearch,
      handlePatientFilter,
      handleSortChange,
      handlePageChange,
    ]
  );

  return (
    <TreatmentPlansContext.Provider value={value}>
      {children}
    </TreatmentPlansContext.Provider>
  );
};

interface TreatmentPlansProviderProps {
  children: ReactNode;
  initialFilters?: Partial<TreatmentPlanFilters>;
}

export const TreatmentPlansProvider = ({
  children,
  initialFilters,
}: TreatmentPlansProviderProps) => (
  <CrudProvider initialFilters={initialFilters}>
    <TreatmentPlansProviderInner>{children}</TreatmentPlansProviderInner>
  </CrudProvider>
);

export const useTreatmentPlansContext = () => {
  const context = useContext(TreatmentPlansContext);
  if (!context) {
    throw new Error(
      "useTreatmentPlansContext must be used within TreatmentPlansProvider"
    );
  }
  return context;
};
