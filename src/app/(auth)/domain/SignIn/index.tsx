"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SignInFields } from "./Fields";
import { signInSchema, SignInSchema } from "./Schema";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SignInAction } from "@/actions/SignIn";

export const SignIn = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInSchema) => {
    startTransition(async () => {
      await SignInAction(data).then((res) => {
        if (res?.error) {
          setError(res?.error);
        } else {
          toast.success("Login realizado com sucesso!");
          router.push("/dashboard");
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <SignInFields />
        {error && <FormMessage>{error}</FormMessage>}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[linear-gradient(135deg,_#E19F4A,_#BA4065,_#412A54)]"
        >
          {isPending ? "Entrando..." : "Entrar"}
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
