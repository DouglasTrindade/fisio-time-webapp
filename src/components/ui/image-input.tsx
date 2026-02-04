"use client";

import { type ChangeEvent, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageInputProps {
  value?: string | null;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export const ImageInput = ({
  value,
  onChange,
  label,
  helperText,
  className,
}: ImageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, startTransition] = useTransition();
  const router = useRouter();
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setPreview(localUrl);

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/users/avatar", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success || !result.data?.url) {
        throw new Error(result.error || "Erro ao enviar avatar");
      }

      setPreview(result.data.url);
      onChange(result.data.url);
      toast.success("Avatar atualizado com sucesso!");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha ao enviar avatar";
      toast.error(message);
      setPreview(value ?? null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium text-foreground">{label}</p>}
      <div className="flex items-center gap-4">
        <Avatar className="h-32 w-32 border">
          {preview ? (
            <AvatarImage src={preview} alt="Avatar" />
          ) : (
            <AvatarFallback>?</AvatarFallback>
          )}
        </Avatar>
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading || isRefreshing}
            onClick={handleSelectClick}
          >
            {isUploading || isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Enviando..." : "Atualizando..."}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Selecionar imagem
              </>
            )}
          </Button>
          {helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>
      </div>
    </div>
  );
};
