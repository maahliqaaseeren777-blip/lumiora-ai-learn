import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/app/plan")({
  head: () => ({ meta: [{ title: "Planner — Lumiora" }] }),
  component: () => <Coming title="Study Planner" desc="Personalised revision calendars are coming next." />,
});

function Coming({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="mt-2 text-muted-foreground">{desc}</p>
    </div>
  );
}
