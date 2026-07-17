import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { sendTutorMessage } from "@/lib/ai.functions";
import { Send, Sparkles, Loader2, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/chat")({
  head: () => ({ meta: [{ title: "AI Tutor — Lumiora" }] }),
  component: ChatPage,
});

type Mode = "tutor" | "gossip" | "brainrot";

function ChatPage() {
  const send = useServerFn(sendTutorMessage);
  const qc = useQueryClient();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("tutor");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const threadsQ = useQuery({
    queryKey: ["threads"],
    queryFn: async () =>
      (await supabase.from("chat_threads").select("id, title, updated_at").order("updated_at", { ascending: false }).limit(30)).data ?? [],
  });

  const messagesQ = useQuery({
    queryKey: ["messages", threadId],
    enabled: !!threadId,
    queryFn: async () =>
      (await supabase.from("chat_messages").select("id, role, content, created_at").eq("thread_id", threadId!).order("created_at", { ascending: true })).data ?? [],
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messagesQ.data, sending]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const msg = input;
    setInput(""); setSending(true);
    try {
      const r = await send({ data: { thread_id: threadId, message: msg, mode } });
      setThreadId(r.thread_id);
      qc.invalidateQueries({ queryKey: ["messages", r.thread_id] });
      qc.invalidateQueries({ queryKey: ["threads"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chat failed");
    } finally { setSending(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-2xl border border-border/60 bg-card/50 p-3 backdrop-blur">
        <button onClick={() => { setThreadId(null); }} className="mb-3 flex w-full items-center gap-2 rounded-xl bg-grad-primary px-3 py-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> New chat
        </button>
        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {threadsQ.data?.map((t) => (
            <button key={t.id} onClick={() => setThreadId(t.id)}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm ${threadId === t.id ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-card"}`}>
              <MessageCircle className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{t.title}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex min-h-[70vh] flex-col rounded-2xl border border-border/60 bg-card/50 backdrop-blur">
        <header className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-grad-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <div>
              <div className="text-sm font-bold">AI Tutor</div>
              <div className="text-xs text-muted-foreground">Warm, patient, exam-focused</div>
            </div>
          </div>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)}
                  className="rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs">
            <option value="tutor">Tutor</option>
            <option value="gossip">Gossip mode</option>
            <option value="brainrot">Brainrot mode</option>
          </select>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
          {(!messagesQ.data || messagesQ.data.length === 0) && !sending && (
            <div className="mt-10 text-center text-muted-foreground">
              <Sparkles className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-sm">Ask me anything — a concept, a problem, or "quiz me on…"</p>
            </div>
          )}
          {messagesQ.data?.map((m) => <Bubble key={m.id} role={m.role as "user" | "assistant"} text={m.content} />)}
          {sending && <Bubble role="assistant" text="Thinking…" pending />}
        </div>

        <form onSubmit={submit} className="border-t border-border/60 p-3">
          <div className="flex items-end gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={1}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(e); } }}
                      placeholder="Ask a question…"
                      className="flex-1 resize-none rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm focus:border-primary/60 focus:outline-none" />
            <button type="submit" disabled={sending || !input.trim()}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-grad-primary text-white shadow-glow disabled:opacity-60">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Bubble({ role, text, pending }: { role: "user" | "assistant"; text: string; pending?: boolean }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-primary/20 px-4 py-2.5 text-sm">{text}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-grad-primary">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </span>
      <div className={`max-w-[85%] whitespace-pre-wrap text-sm text-foreground/95 ${pending ? "opacity-70" : ""}`}>{text}</div>
    </div>
  );
}
