import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Calendar } from "lucide-react";
import { generateStudyPlan } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/plan")({
  head: () => ({ meta: [{ title: "Study Planner — Lumiora" }] }),
  component: PlanPage,
});

interface PlanOut {
  overview?: string;
  days?: Array<{ day: string; focus: string; blocks?: Array<{ time: string; task: string }>; review?: string }>;
  tips?: string[];
}

function PlanPage() {
  const gen = useServerFn(generateStudyPlan);
  const [goal, setGoal] = useState("");
  const [subjects, setSubjects] = useState("");
  const [examDate, setExamDate] = useState("");
  const [hours, setHours] = useState(2);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanOut | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (goal.trim().length < 3) { toast.error("Tell me your study goal first."); return; }
    setLoading(true); setPlan(null);
    try {
      const r = await gen({ data: { goal, subjects, exam_date: examDate, hours_per_day: hours } });
      setPlan(r.content as PlanOut);
      toast.success("Plan ready!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to build plan");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold md:text-3xl">Study Planner</h1>
        <p className="mt-1 text-sm text-muted-foreground">A personalised 7-day revision calendar, built for your goal.</p>
      </div>
      <form onSubmit={submit} className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur md:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Goal (e.g. Ace calc midterm)"
                 className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm focus:border-primary/60 focus:outline-none" />
          <input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Subjects / chapters"
                 className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm focus:border-primary/60 focus:outline-none" />
          <input value={examDate} onChange={(e) => setExamDate(e.target.value)} placeholder="Exam date (optional)"
                 className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm focus:border-primary/60 focus:outline-none" />
          <input type="number" min={0.5} max={12} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))}
                 className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm focus:border-primary/60 focus:outline-none" />
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-grad-primary px-5 py-2.5 font-semibold text-white shadow-glow disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Building…" : "Build my plan"}
          </button>
        </div>
      </form>

      {plan && (
        <div className="mt-6 space-y-4">
          {plan.overview && (
            <div className="rounded-3xl border border-border/60 bg-card/50 p-5 text-foreground/90 backdrop-blur">{plan.overview}</div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {plan.days?.map((d, i) => (
              <div key={i} className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur">
                <div className="flex items-center gap-2 text-primary">
                  <Calendar className="h-4 w-4" />
                  <div className="text-xs font-bold uppercase tracking-wider">{d.day}</div>
                </div>
                <h3 className="mt-1 font-bold">{d.focus}</h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {d.blocks?.map((b, j) => (
                    <li key={j} className="flex gap-2"><span className="min-w-[3rem] text-primary">{b.time}</span> <span className="text-foreground/90">{b.task}</span></li>
                  ))}
                </ul>
                {d.review && <div className="mt-3 rounded-xl bg-background/40 p-3 text-xs text-muted-foreground">Review: {d.review}</div>}
              </div>
            ))}
          </div>
          {plan.tips && plan.tips.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">Coach tips</div>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                {plan.tips.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
