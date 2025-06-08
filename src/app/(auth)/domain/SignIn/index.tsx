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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-sm mx-auto"
      >
        <SignInFields />
        {error && <FormMessage>{error}</FormMessage>}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
};
