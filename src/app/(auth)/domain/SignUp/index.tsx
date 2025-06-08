"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpSchema } from "./Schema";
import { SignUpFields } from "./Fields";
import { Form, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SignUpAction } from "@/actions/SignUp";

export const SignUp = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpSchema) => {
    startTransition(() => {
      SignUpAction(data).then((res) => {
        if (res?.error) {
          setError(res?.error);
        } else {
          toast.success("Cadastro realizado com sucesso!");
          form.reset();
          router.push("/sign-in");
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <SignUpFields />
        {error && <FormMessage>{error}</FormMessage>}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
};
