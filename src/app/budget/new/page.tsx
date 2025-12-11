"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useBudget } from "@/hooks/useBudget";

const newBudgetSchema = z.object({
  name: z.string().min(2),
  coupleNames: z.string().min(2),
  eventDate: z.string().min(4),
  total: z.coerce.number().min(1000),
  notes: z.string().optional(),
});

type NewBudgetValues = z.infer<typeof newBudgetSchema>;

export default function CreateBudgetPage() {
  const router = useRouter();
  const { createBudget } = useBudget();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewBudgetValues>({ resolver: zodResolver(newBudgetSchema) });

  const onSubmit = (values: NewBudgetValues) => {
    const budget = createBudget(values);
    router.push(`/budget/${budget.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-3">
        <p className="section-heading">New budget</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Design a new celebration plan</h1>
        <p className="text-sm text-slate-500">
          Set your total, event date, and couple names. You can add categories and expenses after saving.
        </p>
      </div>
      <form className="space-y-6 rounded-[32px] border border-white/40 bg-white/80 p-10 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input label="Budget name" placeholder="Parker Wedding" {...register("name")} error={errors.name?.message} />
        <Input label="Couple names" placeholder="Avery & Morgan" {...register("coupleNames")} error={errors.coupleNames?.message} />
        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Event date" type="date" {...register("eventDate")} error={errors.eventDate?.message} />
          <Input label="Total budget" type="number" placeholder="50000" {...register("total", { valueAsNumber: true })} error={errors.total?.message} />
        </div>
        <label className="flex w-full flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
          <span className="font-medium">Notes</span>
          <textarea
            className="min-h-[120px] rounded-2xl border border-rose-100/70 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 dark:border-white/10 dark:bg-slate-900/40 dark:text-white"
            placeholder="Share details for your planner."
            {...register("notes")}
          />
        </label>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create budget
        </Button>
      </form>
    </div>
  );
}
