import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Sparkles, MessageCircle, Pencil, Layers, ClipboardList, Brain, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "Home — Lumiora" }] }),
  component: DashboardHome,
});

function DashboardHome() {
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const recentQ = useQuery({
    queryKey: ["recent-generations"],
    queryFn: async () =>
      (await supabase.from("generations").select("id, type, title, created_at").order("created_at", { ascending: false }).limit(6)).data ?? [],
  });

  const p = profileQ.data;
  const name = p?.display_name ?? "there";

  return (
    <div>
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 md:p-8 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Good to see you</p>
            <h1 className="text-3xl font-extrabold md:text-4xl">Hi, {name} <span className="text-gradient-primary">✨</span></h1>
            <p className="mt-2 max-w-lg text-muted-foreground">Pick a tool and let's turn any topic into notes, flashcards, quizzes or a mind map — in seconds.</p>
          </div>
          <div className="flex gap-3">
            <Stat icon={<Flame className="h-4 w-4" />} label="Streak" value={`${p?.streak_days ?? 0} days`} />
            <Stat icon={<Sparkles className="h-4 w-4" />} label="XP" value={`${p?.xp ?? 0}`} />
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-bold">Jump into a tool</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile to="/app/chat" icon={<MessageCircle className="h-5 w-5" />} title="AI Tutor" desc="Ask anything, learn step by step." />
        <Tile to="/app/notes" icon={<Pencil className="h-5 w-5" />} title="AI Notes" desc="Structured summaries from any material." />
        <Tile to="/app/flashcards" icon={<Layers className="h-5 w-5" />} title="Flashcards" desc="Spaced-repetition ready decks." />
        <Tile to="/app/quiz" icon={<ClipboardList className="h-5 w-5" />} title="Quiz Generator" desc="MCQs with explanations." />
        <Tile to="/app/mindmap" icon={<Brain className="h-5 w-5" />} title="Mind Map" desc="Visualise concept connections." />
      </div>

      <h2 className="mt-10 text-lg font-bold">Recent</h2>
      <div className="mt-4 grid gap-3">
        {recentQ.data && recentQ.data.length > 0 ? recentQ.data.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/50 p-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{g.type}</div>
              <div className="font-semibold">{g.title}</div>
            </div>
            <div className="text-xs text-muted-foreground">{new Date(g.created_at).toLocaleDateString()}</div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            Nothing yet — generate your first notes or deck to see it here.
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">{icon}</span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-bold">{value}</div>
      </div>
    </div>
  );
}

function Tile({ to, icon, title, desc }: { to: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link to={to} className="group flex flex-col rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur transition hover:border-primary/40 hover:bg-card">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">{icon}</span>
      <h3 className="mt-6 text-lg font-bold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
