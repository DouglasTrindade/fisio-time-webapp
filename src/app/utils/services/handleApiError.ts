import { AxiosError } from "axios";
import { toast } from "sonner";

export function handleApiError(error: unknown, defaultMessage = "Erro inesperado") {
  if (error instanceof AxiosError) {
    const msg = error.response?.data?.message || error.message;
    toast.error(msg || defaultMessage);
  } else if (error instanceof Error) {
    toast.error(error.message);
  } else if (typeof error === "string") {
    toast.error(error);
  } else {
    toast.error(defaultMessage);
  }
}
