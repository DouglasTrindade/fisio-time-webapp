"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import {
  ExportColumn,
  formatCsvValue,
  getColumnValue,
} from "./exportUtils";

type ExportCsvOptions = {
  filename?: string;
  includeBom?: boolean;
};

export const useExportCsv = <T extends object>() => {
  return useCallback(
    (rows: T[], columns: ExportColumn<T>[], options?: ExportCsvOptions) => {
      if (!columns?.length) {
        toast.error("Selecione ao menos uma coluna para exportação.");
        return;
      }

      const safeRows = rows ?? [];
      const filename = options?.filename ?? "exportacao";

      try {
        const header = columns.map((column) => formatCsvValue(column.header));
        const body = safeRows.map((row) =>
          columns
            .map((column) => formatCsvValue(getColumnValue(row, column)))
            .join(",")
        );

        const bom = options?.includeBom ? "\ufeff" : "";
        const csvContent = [header.join(","), ...body].join("\n");
        const blob = new Blob([bom + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Arquivo CSV gerado com sucesso");
      } catch (error) {
        console.error("Erro ao exportar CSV:", error);
        toast.error("Não foi possível gerar o arquivo CSV");
      }
    },
    []
  );
};
