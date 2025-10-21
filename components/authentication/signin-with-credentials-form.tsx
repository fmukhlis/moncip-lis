"use client";

import z from "zod";
import React from "react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { signInWithCredentials } from "@/features/authentication/action";
import { SignInWithCredentialsSchema } from "@/features/authentication/schema";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function LoginWithCredentialsForm({
  callbackUrl,
}: {
  callbackUrl?: string;
}) {
  const form = useForm<z.infer<typeof SignInWithCredentialsSchema>>({
    resolver: zodResolver(SignInWithCredentialsSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    reValidateMode: "onChange",
  });

  async function onSubmit(data: z.infer<typeof SignInWithCredentialsSchema>) {
    await signInWithCredentials({ data, callbackUrl });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-2">
        <Controller
          name="username"
          render={({ field, fieldState }) => {
            return (
              <Field className="gap-1">
                <FieldLabel htmlFor="username" className="text-base">
                  Username
                </FieldLabel>
                <Input
                  {...field}
                  id="username"
                  required
                  className="h-[50px] text-base"
                  aria-invalid={fieldState.invalid}
                  placeholder="Your username..."
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
