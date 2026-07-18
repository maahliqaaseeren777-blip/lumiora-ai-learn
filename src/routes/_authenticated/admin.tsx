import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, Sparkles, Activity } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Lumiora" }] }),
  component: AdminPage,
});

function AdminPage() {
  const usersQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await supabase.from("profiles").select("id, display_name, created_at, xp, streak_days").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });
  const gensQ = useQuery({
    queryKey: ["admin-gens-count"],
    queryFn: async () => (await supabase.from("generations").select("id", { count: "exact", head: true })).count ?? 0,
  });

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Shield className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Admin Control</h1>
          <p className="text-sm text-muted-foreground">Workspace health, users, and AI usage.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={<Users className="h-4 w-4" />} label="Users" value={String(usersQ.data?.length ?? "…")} />
        <Stat icon={<Sparkles className="h-4 w-4" />} label="Generations" value={String(gensQ.data)} />
        <Stat icon={<Activity className="h-4 w-4" />} label="Status" value="Healthy" />
      </div>

      <h2 className="mt-8 text-lg font-bold">Recent users</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur">
        <table className="w-full text-sm">
          <thead className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">XP</th><th className="px-4 py-3">Streak</th><th className="px-4 py-3">Joined</th></tr>
          </thead>
          <tbody>
            {usersQ.data?.map((u) => (
              <tr key={u.id} className="border-b border-border/40 last:border-none">
                <td className="px-4 py-3 font-medium">{u.display_name ?? "—"}</td>
                <td className="px-4 py-3">{u.xp ?? 0}</td>
                <td className="px-4 py-3">{u.streak_days ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Admin data is scoped by RLS — you only see rows your role can access.</p>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/50 p-4 backdrop-blur">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">{icon}</span>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}
