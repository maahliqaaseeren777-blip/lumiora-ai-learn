import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles, Home, MessageCircle, Pencil, Layers, ClipboardList, Brain,
  Calendar, BarChart3, Settings, LogOut, Menu, X, Mic, Zap, Coffee, FileText, Users, Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const NAV = [
  { to: "/app", label: "Home", icon: Home, adminOnly: false },
  { to: "/app/chat", label: "AI Tutor", icon: MessageCircle, adminOnly: false },
  { to: "/app/notes", label: "Notes", icon: Pencil, adminOnly: false },
  { to: "/app/flashcards", label: "Flashcards", icon: Layers, adminOnly: false },
  { to: "/app/quiz", label: "Quiz", icon: ClipboardList, adminOnly: false },
  { to: "/app/mindmap", label: "Mind Maps", icon: Brain, adminOnly: false },
  { to: "/app/essay", label: "Essay Writer", icon: FileText, adminOnly: false },
  { to: "/app/podcast", label: "Podcast", icon: Mic, adminOnly: false },
  { to: "/app/brainrot", label: "Brainrot", icon: Zap, adminOnly: false },
  { to: "/app/gossip", label: "Gossip", icon: Coffee, adminOnly: false },
  { to: "/app/plan", label: "Planner", icon: Calendar, adminOnly: false },
  { to: "/app/community", label: "Community", icon: Users, adminOnly: false },
  { to: "/app/stats", label: "Stats", icon: BarChart3, adminOnly: false },
  { to: "/admin", label: "Admin", icon: Shield, adminOnly: true },
] as const;


export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/app" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-grad-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="font-extrabold tracking-widest text-sm">LUMIORA</span>
        </Link>
        <button onClick={() => setOpen((v) => !v)} className="rounded-full border border-border p-2">
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </header>

      <div className="flex">
        <Sidebar mobileOpen={open} onClose={() => setOpen(false)} />
        <main className="min-h-screen flex-1 md:pl-64">
          <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isAdminQ = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return !!data;
    },
    staleTime: 5 * 60 * 1000,
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const items = NAV.filter((n) => !n.adminOnly || isAdminQ.data === true);

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border/60 bg-card/60 backdrop-blur-xl transition-transform md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-grad-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="font-extrabold tracking-widest text-sm">LUMIORA</span>
        </div>
        <nav className="flex flex-col gap-1 p-3 overflow-y-auto max-h-[calc(100vh-9rem)]">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/app" && pathname.startsWith(to));
            return (
              <Link key={to} to={to} onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
                  active ? "bg-primary/15 text-foreground border border-primary/30" : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}>
                <Icon className="h-4 w-4" /> {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-0 bottom-0 border-t border-border/60 p-3">
          <Link to="/app/settings" onClick={onClose}
            className="mb-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground">
            <Settings className="h-4 w-4" /> Settings
          </Link>
          <button onClick={signOut}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-card hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
