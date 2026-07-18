import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Generator } from "@/components/generator";
import { generateEssay } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/essay")({
  head: () => ({ meta: [{ title: "Essay Writer — Lumiora" }] }),
  component: EssayPage,
});

interface EssayOut {
  content: { title?: string; intro?: string; body?: Array<{ heading: string; paragraph: string }>; conclusion?: string };
}

function EssayPage() {
  const gen = useServerFn(generateEssay);
  return (
    <Generator
      title="Essay Writer"
      desc="Draft structured essays from a prompt or source material."
      sourcePlaceholder="Paste a topic, prompt, or source text…"
      onGenerate={(d) => gen({ data: { ...d, length: "medium", tone: "academic" } })}
      renderResult={(r) => {
        const { content } = r as EssayOut;
        return (
          <article className="prose prose-invert max-w-none">
            {content.title && <h2 className="text-2xl font-extrabold">{content.title}</h2>}
            {content.intro && <p className="text-foreground/90">{content.intro}</p>}
            {content.body?.map((s, i) => (
              <section key={i} className="mt-4">
                <h3 className="text-lg font-bold">{s.heading}</h3>
                <p className="text-foreground/90">{s.paragraph}</p>
              </section>
            ))}
            {content.conclusion && (
              <section className="mt-4">
                <h3 className="text-lg font-bold">Conclusion</h3>
                <p className="text-foreground/90">{content.conclusion}</p>
              </section>
            )}
          </article>
        );
      }}
    />
  );
}
