"use client";

import { useCallback } from "react";
import xlsx, { type IJsonSheet } from "json-as-xlsx";
import { toast } from "sonner";

import {
  ExportColumn,
  formatSheetValue,
  getColumnValue,
} from "./exportUtils";

type ExportXlsxOptions = {
  filename?: string;
  sheetName?: string;
};

export const useExportXlsx = <T extends object>() => {
  return useCallback(
    (
      rows: T[],
      columns: ExportColumn<T>[],
      options?: ExportXlsxOptions
    ) => {
      if (!columns?.length) {
        toast.error("Selecione ao menos uma coluna para exportação.");
        return;
      }

      const safeRows = rows ?? [];
      const filename = options?.filename ?? "exportacao";
      const sheetName = options?.sheetName ?? "Dados";

      try {
        const sheet: IJsonSheet = {
          sheet: sheetName,
          columns: columns.map((column) => ({
            label: column.header,
            value: (row) =>
              formatSheetValue(
                getColumnValue(row as T, column)
              ),
          })),
          content: safeRows as IJsonSheet["content"],
        };

        xlsx([sheet], {
          fileName: filename,
          writeMode: "download",
        });

        toast.success("Arquivo XLSX gerado com sucesso");
      } catch (error) {
        console.error("Erro ao exportar XLSX:", error);
        toast.error("Não foi possível gerar o arquivo XLSX");
      }
    },
    []
  );
};
