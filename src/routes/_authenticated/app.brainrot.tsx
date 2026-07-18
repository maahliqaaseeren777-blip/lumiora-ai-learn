import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Generator } from "@/components/generator";
import { generateBrainrot } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/brainrot")({
  head: () => ({ meta: [{ title: "Brainrot Mode — Lumiora" }] }),
  component: BrainrotPage,
});

interface Out { content: { hook?: string; beats?: string[]; tldr?: string } }

function BrainrotPage() {
  const gen = useServerFn(generateBrainrot);
  return (
    <Generator
      title="Brainrot Mode"
      desc="Gen-Z chaotic explainers — accurate facts, unhinged delivery."
      onGenerate={(d) => gen({ data: d })}
      renderResult={(r) => {
        const { content } = r as Out;
        return (
          <div className="space-y-4">
            {content.hook && <div className="rounded-2xl bg-grad-primary p-5 text-lg font-bold text-white shadow-glow">{content.hook}</div>}
            <ul className="space-y-2">
              {content.beats?.map((b, i) => (
                <li key={i} className="rounded-2xl border border-border/60 bg-background/40 p-3 text-foreground/90">▸ {b}</li>
              ))}
            </ul>
            {content.tldr && (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">TL;DR</div>
                <p className="mt-1 text-sm">{content.tldr}</p>
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
