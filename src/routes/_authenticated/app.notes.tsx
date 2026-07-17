import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Generator } from "@/components/generator";
import { generateNotes } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/notes")({
  head: () => ({ meta: [{ title: "AI Notes — Lumiora" }] }),
  component: NotesPage,
});

interface Notes { content: { summary?: string; sections?: Array<{ heading: string; bullets?: string[]; key_terms?: Array<{ term: string; definition: string }> }> } }

function NotesPage() {
  const gen = useServerFn(generateNotes);
  return (
    <Generator
      title="AI Notes"
      desc="Structured, exam-focused notes from any material."
      onGenerate={(d) => gen({ data: d })}
      renderResult={(r) => {
        const { content } = r as Notes;
        return (
          <div className="space-y-6">
            {content.summary && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Summary</h3>
                <p className="mt-2 text-foreground/90">{content.summary}</p>
              </div>
            )}
            {content.sections?.map((s, i) => (
              <div key={i}>
                <h3 className="text-lg font-bold">{s.heading}</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/90">
                  {s.bullets?.map((b, j) => <li key={j}>{b}</li>)}
                </ul>
                {s.key_terms && s.key_terms.length > 0 && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {s.key_terms.map((k, j) => (
                      <div key={j} className="rounded-xl border border-border/60 bg-background/40 p-3">
                        <div className="font-semibold text-primary">{k.term}</div>
                        <div className="text-sm text-muted-foreground">{k.definition}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
