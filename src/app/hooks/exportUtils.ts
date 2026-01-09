"use client";

export type ExportColumn<T extends object> = {
  header: string;
  accessor: keyof T | ((row: T) => unknown);
};

export const getColumnValue = <T extends object>(
  row: T,
  column: ExportColumn<T>
) => {
  if (typeof column.accessor === "function") {
    return column.accessor(row);
  }

  return row[column.accessor];
};

export const normalizeValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  return value;
};

export const formatCsvValue = (value: unknown) => {
  const normalized = normalizeValue(value);
  let stringValue: string;

  if (normalized instanceof Date) {
    stringValue = normalized.toISOString();
  } else if (typeof normalized === "object") {
    stringValue = JSON.stringify(normalized);
  } else {
    stringValue = String(normalized);
  }

  const escaped = stringValue.replace(/"/g, '""');

  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

export const formatSheetValue = (value: unknown) => {
  const normalized = normalizeValue(value);

  if (
    typeof normalized === "number" ||
    typeof normalized === "boolean" ||
    normalized instanceof Date
  ) {
    return normalized;
  }

  if (typeof normalized === "object") {
    return JSON.stringify(normalized);
  }

  return String(normalized);
};
