import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Generator } from "@/components/generator";
import { generateGossip } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/gossip")({
  head: () => ({ meta: [{ title: "Gossip Mode — Lumiora" }] }),
  component: GossipPage,
});

interface Out { content: { setup?: string; conversation?: Array<{ speaker: string; line: string }>; takeaway?: string } }

function GossipPage() {
  const gen = useServerFn(generateGossip);
  return (
    <Generator
      title="Gossip Mode"
      desc="Fictional friend-chats that make dense topics stick."
      onGenerate={(d) => gen({ data: d })}
      renderResult={(r) => {
        const { content } = r as Out;
        return (
          <div className="space-y-4">
            {content.setup && <p className="italic text-muted-foreground">{content.setup}</p>}
            <div className="space-y-2">
              {content.conversation?.map((c, i) => {
                const isMia = c.speaker === "Mia";
                return (
                  <div key={i} className={`flex ${isMia ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${isMia ? "bg-primary/15" : "bg-accent/15"}`}>
                      <div className="text-xs font-bold text-muted-foreground">{c.speaker}</div>
                      {c.line}
                    </div>
                  </div>
                );
              })}
            </div>
            {content.takeaway && (
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm">
                💡 {content.takeaway}
              </div>
            )}
          </div>
        );
      }}
    />
  );
}
