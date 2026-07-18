import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Generator } from "@/components/generator";
import { generatePodcast } from "@/lib/ai.functions";
import { Mic } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/podcast")({
  head: () => ({ meta: [{ title: "Podcast Script — Lumiora" }] }),
  component: PodcastPage,
});

interface PodOut {
  content: { title?: string; intro?: string; segments?: Array<{ speaker: string; line: string }>; outro?: string };
}

function PodcastPage() {
  const gen = useServerFn(generatePodcast);
  return (
    <Generator
      title="Podcast Script"
      desc="Turn any topic into a two-host study podcast script."
      onGenerate={(d) => gen({ data: d })}
      renderResult={(r) => {
        const { content } = r as PodOut;
        return (
          <div className="space-y-4">
            {content.title && <h2 className="text-xl font-extrabold">{content.title}</h2>}
            {content.intro && <p className="italic text-muted-foreground">{content.intro}</p>}
            <div className="space-y-2">
              {content.segments?.map((s, i) => (
                <div key={i} className="flex gap-3 rounded-2xl border border-border/60 bg-background/40 p-3">
                  <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.speaker.includes("A") ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                    <Mic className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.speaker}</div>
                    <p className="text-sm text-foreground/90">{s.line}</p>
                  </div>
                </div>
              ))}
            </div>
            {content.outro && <p className="italic text-muted-foreground">{content.outro}</p>}
          </div>
        );
      }}
    />
  );
}
