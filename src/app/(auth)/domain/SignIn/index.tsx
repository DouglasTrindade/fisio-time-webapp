"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SignInFields } from "./Fields";
import { signInSchema, SignInSchema } from "./Schema";
import { useRouter } from "next/navigation";
import { SignInAction } from "@/actions/SignIn";

export const SignIn = () => {
  const router = useRouter();
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { isSubmitting } = form.formState

  const onSubmit = async (data: SignInSchema) => {
    form.clearErrors("root");

    const result = await SignInAction(data);

    if (result?.error) {
      form.setError("root", { message: result.error });
      toast.error(result.error);
      return;
    }

    toast.success("Login realizado com sucesso!");
    router.push("/dashboard");
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SignInFields />
        {rootError && <FormMessage>{rootError}</FormMessage>}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[linear-gradient(135deg,_#E19F4A,_#BA4065,_#412A54)]"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
        <div className="flex justify-center font-semibold">
          <span className="me-2">Não tem uma conta?</span>
          <a href="/sign-up" className="text-blue-600 visited:text-purple-600">
            Cadastre-se
          </a>
        </div>
      </form>
    </Form>
  );
};
