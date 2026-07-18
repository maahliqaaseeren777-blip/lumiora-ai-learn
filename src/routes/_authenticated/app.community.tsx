import { createFileRoute } from "@tanstack/react-router";
import { Users, MessageCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/community")({
  head: () => ({ meta: [{ title: "Community — Lumiora" }] }),
  component: CommunityPage,
});

const GROUPS = [
  { name: "Calculus Crew", members: 214, tag: "Math" },
  { name: "Organic Chem Study Hall", members: 128, tag: "Chemistry" },
  { name: "History Buffs", members: 341, tag: "History" },
  { name: "CS Interview Prep", members: 502, tag: "Coding" },
];

function CommunityPage() {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Community</h1>
          <p className="mt-1 text-sm text-muted-foreground">Study groups, shared decks, and quiet company while you grind.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-grad-primary px-4 py-2 text-sm font-semibold text-white shadow-glow">
          <Sparkles className="h-4 w-4" /> Start a group
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.name} className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-bold">{g.name}</div>
                  <div className="text-xs text-muted-foreground">{g.members} members · {g.tag}</div>
                </div>
              </div>
              <button className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-primary/50">Join</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-dashed border-border/60 bg-card/40 p-6 text-center">
        <MessageCircle className="mx-auto h-6 w-6 text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Threaded discussions & shared decks unlock as your workspace grows.</p>
      </div>
    </div>
  );
}
