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

const adminRegisterSchema = z.object({
  fullName: z.string().min(2, "Enter your name"),
  email: z.string().email(),
  password: z.string().min(6, "Use at least 6 characters"),
});

type AdminRegisterValues = z.infer<typeof adminRegisterSchema>;

export default function AdminRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminRegisterValues>({ resolver: zodResolver(adminRegisterSchema) });

  const onSubmit = async (values: AdminRegisterValues) => {
    setError(null);
    try {
      await api.post("/admin/auth/register", values);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Registration failed");
      } else {
        setError("Registration failed");
      }
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-10 px-6 py-16">
      <div>
        <p className="text-sm uppercase tracking-widest text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-semibold text-slate-900">Create admin account</h1>
        <p className="text-sm text-slate-600">Set up a dedicated login for the admin view dashboard.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full name" placeholder="Avery Admin" {...register("fullName")} error={errors.fullName?.message} />
        <Input label="Email" type="email" placeholder="admin@example.com" {...register("email")} error={errors.email?.message} />
        <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Already onboard? <Link href="/admin/login" className="text-rose-500">Sign in instead</Link>
      </p>
    </main>
  );
}
