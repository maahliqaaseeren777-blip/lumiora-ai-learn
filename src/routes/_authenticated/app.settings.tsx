import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({ meta: [{ title: "Settings — Lumiora" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["profile"],
    queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data,
  });
  const [name, setName] = useState("");
  const p = q.data;

  async function save() {
    const display_name = name || p?.display_name || "";
    const { error } = await supabase.from("profiles").update({ display_name }).eq("id", p!.id);
    if (error) toast.error(error.message); else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["profile"] }); }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold md:text-3xl">Settings</h1>
      <div className="mt-6 max-w-lg rounded-2xl border border-border/60 bg-card/50 p-5">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Display name</label>
        <input defaultValue={p?.display_name ?? ""} onChange={(e) => setName(e.target.value)}
               className="mt-2 w-full rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm focus:outline-none" />
        <button onClick={save} className="mt-4 rounded-full bg-grad-primary px-4 py-2 text-sm font-semibold text-white">Save</button>
      </div>
    </div>
  );
}
