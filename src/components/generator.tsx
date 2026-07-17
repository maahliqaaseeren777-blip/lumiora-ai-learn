import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

export interface GeneratorProps {
  title: string;
  desc: string;
  sourcePlaceholder?: string;
  onGenerate: (input: { title: string; subject: string; source: string }) => Promise<unknown>;
  renderResult: (data: unknown) => React.ReactNode;
  extra?: React.ReactNode;
}

export function Generator({ title, desc, sourcePlaceholder, onGenerate, renderResult, extra }: GeneratorProps) {
  const [t, setT] = useState("");
  const [subject, setSubject] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (source.trim().length < 20) { toast.error("Give me at least a paragraph of material."); return; }
    setLoading(true); setResult(null);
    try {
      const r = await onGenerate({ title: t || "Untitled", subject, source });
      setResult(r);
      toast.success("Generated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
      <form onSubmit={submit} className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur md:p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={t} onChange={(e) => setT(e.target.value)} placeholder="Title (e.g. Chapter 3 – Derivatives)"
                 className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm focus:border-primary/60 focus:outline-none" />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (optional)"
                 className="rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm focus:border-primary/60 focus:outline-none" />
        </div>
        <textarea value={source} onChange={(e) => setSource(e.target.value)} rows={10}
                  placeholder={sourcePlaceholder ?? "Paste lecture notes, chapter text, or a topic description…"}
                  className="mt-3 w-full rounded-2xl border border-border bg-background/40 px-4 py-3 text-sm focus:border-primary/60 focus:outline-none" />
        {extra}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button type="submit" disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-grad-primary px-5 py-2.5 font-semibold text-white shadow-glow disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </form>

      {result !== null && (
        <div className="mt-6 rounded-3xl border border-border/60 bg-card/50 p-5 backdrop-blur md:p-6">
          {renderResult(result)}
        </div>
      )}
    </div>
  );
}
