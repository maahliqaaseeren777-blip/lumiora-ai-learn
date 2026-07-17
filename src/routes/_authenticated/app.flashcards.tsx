import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Generator } from "@/components/generator";
import { generateFlashcards } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/flashcards")({
  head: () => ({ meta: [{ title: "Flashcards — Lumiora" }] }),
  component: FlashcardsPage,
});

interface Deck { content: { cards?: Array<{ front: string; back: string; difficulty?: string }> } }

function FlashcardsPage() {
  const gen = useServerFn(generateFlashcards);
  const [count, setCount] = useState(12);
  return (
    <Generator
      title="Flashcards"
      desc="Spaced-repetition-ready decks in one click."
      onGenerate={(d) => gen({ data: { ...d, count } })}
      extra={
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <label>Cards:</label>
          <input type="number" min={4} max={30} value={count}
                 onChange={(e) => setCount(Math.max(4, Math.min(30, Number(e.target.value) || 12)))}
                 className="w-20 rounded-xl border border-border bg-background/40 px-3 py-1.5 text-foreground focus:outline-none" />
        </div>
      }
      renderResult={(r) => <FlashcardsView cards={(r as Deck).content.cards ?? []} />}
    />
  );
}

function FlashcardsView({ cards }: { cards: Array<{ front: string; back: string; difficulty?: string }> }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((c, i) => (
        <button key={i} onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
                className="min-h-[140px] rounded-2xl border border-border/60 bg-background/40 p-5 text-left transition hover:border-primary/40">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {flipped[i] ? "Answer" : "Question"} · {c.difficulty ?? "medium"}
          </div>
          <div className="mt-2 font-semibold text-foreground">{flipped[i] ? c.back : c.front}</div>
        </button>
      ))}
    </div>
  );
}
