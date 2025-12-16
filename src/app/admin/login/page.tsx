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

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({ resolver: zodResolver(adminLoginSchema) });

  const onSubmit = async (values: AdminLoginValues) => {
    setError(null);
    try {
      await api.post("/admin/auth/login", values);
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Login failed");
      } else {
        setError("Login failed");
      }
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-10 px-6 py-16">
      <div>
        <p className="text-sm uppercase tracking-widest text-slate-500">Admin Console</p>
        <h1 className="text-3xl font-semibold text-slate-900">Sign in</h1>
        <p className="text-sm text-slate-600">Use the admin credentials you created to access the control panel.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email" type="email" placeholder="you@example.com" {...register("email")} error={errors.email?.message} />
        <Input label="Password" type="password" {...register("password")} error={errors.password?.message} />
        {error ? <p className="text-sm text-rose-500">{error}</p> : null}
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Enter dashboard
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Need an account? <Link href="/admin/register" className="text-rose-500">Create one</Link>
      </p>
    </main>
  );
}
