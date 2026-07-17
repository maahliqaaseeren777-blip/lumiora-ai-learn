import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Generator } from "@/components/generator";
import { generateQuiz } from "@/lib/ai.functions";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/quiz")({
  head: () => ({ meta: [{ title: "Quiz — Lumiora" }] }),
  component: QuizPage,
});

interface Quiz { content: { questions?: Array<{ q: string; choices: string[]; answer_index: number; explanation?: string }> } }

function QuizPage() {
  const gen = useServerFn(generateQuiz);
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("mixed");
  return (
    <Generator
      title="Quiz Generator"
      desc="Exam-quality multiple-choice questions with explanations."
      onGenerate={(d) => gen({ data: { ...d, count, difficulty } })}
      extra={
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <label>Questions:</label>
          <input type="number" min={3} max={20} value={count}
                 onChange={(e) => setCount(Math.max(3, Math.min(20, Number(e.target.value) || 8)))}
                 className="w-20 rounded-xl border border-border bg-background/40 px-3 py-1.5 text-foreground focus:outline-none" />
          <label>Difficulty:</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="rounded-xl border border-border bg-background/40 px-3 py-1.5 text-foreground focus:outline-none">
            <option value="easy">Easy</option><option value="medium">Medium</option>
            <option value="hard">Hard</option><option value="mixed">Mixed</option>
          </select>
        </div>
      }
      renderResult={(r) => <QuizPlayer questions={(r as Quiz).content.questions ?? []} />}
    />
  );
}

function QuizPlayer({ questions }: { questions: Array<{ q: string; choices: string[]; answer_index: number; explanation?: string }> }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const chosen = picked[i];
        return (
          <div key={i} className="rounded-2xl border border-border/60 bg-background/40 p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Q{i + 1}</div>
            <p className="mt-1 font-semibold">{q.q}</p>
            <div className="mt-3 grid gap-2">
              {q.choices.map((c, j) => {
                const isCorrect = j === q.answer_index;
                const isChosen = chosen === j;
                const revealed = chosen !== undefined;
                return (
                  <button key={j} disabled={revealed} onClick={() => setPicked((p) => ({ ...p, [i]: j }))}
                          className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                            !revealed ? "border-border hover:border-primary/40"
                            : isCorrect ? "border-green-500/60 bg-green-500/10"
                            : isChosen ? "border-red-500/60 bg-red-500/10"
                            : "border-border opacity-70"
                          }`}>
                    <span>{c}</span>
                    {revealed && isCorrect && <Check className="h-4 w-4 text-green-500" />}
                    {revealed && isChosen && !isCorrect && <X className="h-4 w-4 text-red-500" />}
                  </button>
                );
              })}
            </div>
            {chosen !== undefined && q.explanation && (
              <p className="mt-3 rounded-xl bg-primary/10 p-3 text-sm text-foreground/90">
                <span className="font-semibold">Why:</span> {q.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
