import Link from "next/link";
import { ArrowRight, Calendar, ChartNoAxesColumn, Palette } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const stats = [
  { label: "Budgets crafted", value: "240+" },
  { label: "Vendors tracked", value: "480" },
  { label: "Average savings", value: "$12k" },
];

const features = [
  {
    title: "Budget rituals",
    description: "Assign funds to curated categories and adjust allocations on the fly.",
  },
  {
    title: "Real-time insights",
    description: "See how every swipe affects your totals with instant recalculations.",
  },
  {
    title: "Vendor-ready reports",
    description: "Download elegant summaries to share with planners, parents, or vendors.",
  },
];

const steps = [
  {
    title: "Set your celebration goals",
    icon: Calendar,
    copy: "Tell us the date, guest count, and vibe. We build a tailored baseline instantly.",
  },
  {
    title: "Invite your dream team",
    icon: Palette,
    copy: "Collaborate with your partner, planner, or parents—everyone stays aligned.",
  },
  {
    title: "Track with graceful charts",
    icon: ChartNoAxesColumn,
    copy: "Interactive charts make it simple to spot overages and celebrate savings.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-24 pb-16">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="section-heading">Wedding finances, reimagined</p>
          <h1 className="hero-title font-[var(--font-playfair)]">
            A serene space to plan the celebration you both imagine.
          </h1>
          <p className="hero-subtitle">
            Serenité blends luxurious UI with pragmatic tooling. Set budgets, share updates, track deposits, and keep
            every promise to yourselves.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/register" className="flex items-center gap-2">
                Begin your plan <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard">Explore dashboard</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <Card className="relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-200/60 blur-3xl dark:bg-rose-500/30" />
          <div className="absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-amber-200/70 blur-3xl dark:bg-amber-400/20" />
          <div className="relative space-y-6">
            <p className="section-heading">Live preview</p>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Your celebration compass</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Each dashboard module is crafted for clarity. Mobile-ready layouts mean you can approve quotes on the go
              while your partner tracks totals from the sofa.
            </p>
            <div className="rounded-2xl border border-white/30 bg-white/80 p-4 shadow-inner dark:border-white/10 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-200">This month</p>
              <p className="mt-2 text-3xl font-semibold text-rose-500">$32,480</p>
              <p className="text-xs text-slate-500">allocated across 8 categories</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-white/40 bg-white/90 p-4 text-sm dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">{feature.title}</p>
                  <p className="mt-2 text-slate-600 dark:text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeading
          eyebrow="How it flows"
          title="Simple, guided steps"
          description="From first login to final toast, Serenité keeps you focused on the joyful decisions."
        />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="space-y-4 p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 dark:bg-rose-500/20 dark:text-rose-100">
                <step.icon className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{step.copy}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <Card className="flex flex-col gap-8 p-10 text-center md:flex-row md:items-center md:text-left">
          <div className="flex-1 space-y-4">
            <p className="section-heading">Ready when you are</p>
            <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">Design a budget worthy of your story</h3>
            <p className="text-slate-600 dark:text-slate-200">
              Get unlimited budgets, collaborative editing, vendor tracking, and stunning exports. Cancel anytime.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Button asChild>
              <Link href="/register">Get started free</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
