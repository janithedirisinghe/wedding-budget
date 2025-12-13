"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { api } from "@/lib/axios";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    partnerName: z.string().min(2, "Enter your partner's name"),
    email: z.string().email(),
    password: z.string().min(6, "Password should be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterValues) => {
    setServerMessage(null);
    try {
      await api.post("/auth/register", {
        fullName: values.fullName,
        partnerName: values.partnerName,
        email: values.email,
        password: values.password,
      });
      setServerMessage("Account created. Redirecting you to your dashboard…");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      if (isAxiosError(error)) {
        setServerMessage(error.response?.data?.message ?? "We could not create your account. Please try again.");
      } else {
        setServerMessage("We could not create your account. Please try again.");
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-10 rounded-[32px] border border-white/40 bg-white/80 p-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
      <div className="space-y-3 text-center">
        <p className="section-heading">Create your space</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Register your Serenité account</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Collaborative planning, real-time tracking, export-ready reports.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Your name" placeholder="Avery" {...register("fullName")} error={errors.fullName?.message} />
          <Input label="Partner name" placeholder="Morgan" {...register("partnerName")} error={errors.partnerName?.message} />
        </div>
        <Input label="Email" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
          <Input label="Confirm password" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create Account
        </Button>
        {serverMessage ? <p className="text-center text-sm text-rose-500">{serverMessage}</p> : null}
      </form>
      <p className="text-center text-sm text-slate-600 dark:text-slate-300">
        Already have an account? <Link href="/login" className="text-rose-500">Log in</Link>
      </p>
    </div>
  );
}
