import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const HISTORY_BUCKET = "patient-history";

export const toStringValue = (
  value: FormDataEntryValue | null,
): string | undefined => {
  if (value === null) return undefined;
  if (typeof value === "string") return value;
  return value.toString();
};

export const parseHistoryRequest = async <T extends Record<string, unknown>>(
  request: NextRequest,
): Promise<{ payload: T; file: File | null }> => {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const json = (await request.json()) as T;
    return { payload: json, file: null };
  }

  const formData = await request.formData();
  const file = formData.get("attachment");
  const entries: Record<string, string | undefined> = {};

  formData.forEach((value, key) => {
    if (key === "attachment") return;
    entries[key] = toStringValue(value);
  });

  return {
    payload: entries as T,
    file: file instanceof File ? file : null,
  };
};

export const uploadHistoryAttachment = async (
  patientId: string,
  file: File,
) => {
  if (!supabaseAdmin) {
    throw new Error("Supabase não configurado para upload de anexos");
  }

  const fileExt = file.name?.split(".").pop() || "bin";
  const filePath = `${patientId}/${randomUUID()}.${fileExt}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabaseAdmin.storage
    .from(HISTORY_BUCKET)
    .upload(filePath, buffer, {
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || "Falha ao enviar o anexo");
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(HISTORY_BUCKET).getPublicUrl(filePath);

  return { path: filePath, url: publicUrl };
};

export const deleteHistoryAttachment = async (path?: string | null) => {
  if (!path || !supabaseAdmin) return;

  await supabaseAdmin.storage.from(HISTORY_BUCKET).remove([path]);
};
