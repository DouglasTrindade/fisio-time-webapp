"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpSchema } from "./Schema";
import { SignUpFields } from "./Fields";
import { Form, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { SignUpAction } from "@/actions/SignUp";

interface SignUpProps {
  inviteToken?: string
}

export const SignUp = ({ inviteToken }: SignUpProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tokenFromUrl, setTokenFromUrl] = useState(inviteToken ?? "");
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      inviteToken: inviteToken ?? "",
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const search = new URLSearchParams(window.location.search);
    const urlToken = search.get("invite");
    const resolvedToken = urlToken ?? inviteToken ?? "";
    setTokenFromUrl(resolvedToken);
    form.setValue("inviteToken", resolvedToken);
  }, [inviteToken, form]);

  const onSubmit = async (data: SignUpSchema) => {
    form.clearErrors("root");
    const payload: SignUpSchema = {
      ...data,
      inviteToken: tokenFromUrl || data.inviteToken || "",
    };
    startTransition(() => {
      SignUpAction(payload).then((res) => {
        if (res?.error) {
          form.setError("root", { message: res.error });
          toast.error(res.error);
          return;
        }

        toast.success("Cadastro realizado com sucesso!");
        form.reset();
        router.push("/sign-in");
      });
    });
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <input type="hidden" {...form.register("inviteToken")} />
        <SignUpFields />
        {rootError && <FormMessage>{rootError}</FormMessage>}
        <Button
          type="submit"
          className="w-full bg-[linear-gradient(135deg,_#E19F4A,_#BA4065,_#412A54)]"
          disabled={isPending}
        >
          {isPending ? "Cadastrando..." : "Cadastrar"}
        </Button>
        <div className="flex justify-center font-semibold">
          <a href="/sign-in">Já possuo uma conta</a>
        </div>
      </form>
    </Form>
  );
};
