"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

export const SignInFields = () => {
  const { control } = useFormContext();

  return (
    <>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="email" className="text-white">
              E-mail
            </Label>
            <FormControl>
              <Input
                type="email"
                placeholder="seu@email.com"
                className="text-white"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <Label htmlFor="password" className="text-white">
              Senha
            </Label>
            <FormControl>
              <Input
                type="password"
                placeholder="••••••••"
                className="text-white"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
