"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { api } from "@/lib/axios";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      await api.post("/auth/login", values);
    } catch (err) {
      console.error(err);
      setError("Login failed. Double-check your credentials.");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-10 rounded-[32px] border border-white/40 bg-white/90 p-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="space-y-3 text-center">
        <p className="section-heading">Welcome back</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Log in to your dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Pick up exactly where you left off.</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
        <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>
      <p className="text-center text-sm text-slate-600 dark:text-slate-300">
        New here? <Link href="/register" className="text-rose-500">Create an account</Link>
      </p>
    </div>
  );
}
