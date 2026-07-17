import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/stats")({
  head: () => ({ meta: [{ title: "Stats — Lumiora" }] }),
  component: StatsPage,
});

function StatsPage() {
  const q = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const gens = (await supabase.from("generations").select("type")).data ?? [];
      const counts: Record<string, number> = {};
      gens.forEach((g) => { counts[g.type] = (counts[g.type] ?? 0) + 1; });
      return counts;
    },
  });
  const items = Object.entries(q.data ?? {});
  return (
    <div>
      <h1 className="text-2xl font-extrabold md:text-3xl">Your Stats</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything you've generated so far.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border/60 p-6 text-center text-muted-foreground">
            No activity yet.
          </div>
        ) : items.map(([type, n]) => (
          <div key={type} className="rounded-2xl border border-border/60 bg-card/50 p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{type}</div>
            <div className="mt-1 text-3xl font-extrabold">{n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
