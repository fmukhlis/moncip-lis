"use client";

import z from "zod";

import { Input } from "../ui/input";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { SignInWithCredentialsSchema } from "@/features/authentication/schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import React from "react";

export default function LoginWithCredentialsForm(
  props: React.ComponentPropsWithoutRef<"form">,
) {
  const form = useForm<z.infer<typeof SignInWithCredentialsSchema>>({
    resolver: zodResolver(SignInWithCredentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    reValidateMode: "onChange",
  });

  function onSubmit(data: z.infer<typeof SignInWithCredentialsSchema>) {}

  return (
    <form {...props} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-2">
        <Controller
          name="email"
          render={({ field, fieldState }) => {
            return (
              <Field className="gap-1">
                <FieldLabel htmlFor="email" className="text-base">
                  Email
                </FieldLabel>
                <Input
                  {...field}
                  id="email"
                  required
                  className="h-[50px] text-base"
                  aria-invalid={fieldState.invalid}
                  placeholder="name@domain.com"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
          control={form.control}
        />
        <Controller
          name="password"
          render={({ field, fieldState }) => {
            return (
              <Field className="gap-1">
                <FieldLabel htmlFor="password" className="text-base">
                  Password
                </FieldLabel>
                <Input
                  {...field}
                  id="password"
                  type="password"
                  required
                  className="h-[50px] text-base"
                  placeholder="••••••••"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
          control={form.control}
        />
        <Field>
          <Button
            type="submit"
            size={"google-spec"}
            variant={"default"}
            className="text-base font-semibold mt-2"
          >
            Sign In
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
