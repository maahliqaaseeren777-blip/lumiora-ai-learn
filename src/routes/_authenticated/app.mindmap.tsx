import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Generator } from "@/components/generator";
import { generateMindMap } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/app/mindmap")({
  head: () => ({ meta: [{ title: "Mind Map — Lumiora" }] }),
  component: MindMapPage,
});

interface Node { label: string; children?: Node[] }
interface Map { content: { root?: Node } }

function MindMapPage() {
  const gen = useServerFn(generateMindMap);
  return (
    <Generator
      title="Mind Map"
      desc="Turn a topic into a hierarchy of ideas."
      onGenerate={(d) => gen({ data: d })}
      renderResult={(r) => {
        const root = (r as Map).content.root;
        return root ? <MindMapTree node={root} depth={0} /> : <p className="text-muted-foreground">No map returned.</p>;
      }}
    />
  );
}

function MindMapTree({ node, depth }: { node: Node; depth: number }) {
  const palette = ["bg-primary/20 text-primary border-primary/40",
                   "bg-accent/20 text-accent border-accent/40",
                   "bg-[oklch(0.35_0.11_20)]/40 text-[oklch(0.82_0.13_20)] border-[oklch(0.5_0.14_20)]/40",
                   "bg-[oklch(0.32_0.09_150)]/40 text-[oklch(0.82_0.13_150)] border-[oklch(0.5_0.12_150)]/40"];
  const cls = palette[depth % palette.length];
  return (
    <div className={depth === 0 ? "flex flex-col items-center" : "ml-6 border-l border-dashed border-border/60 pl-6 pt-3"}>
      <div className={`inline-flex rounded-2xl border px-4 py-2 font-semibold ${cls}`}>{node.label}</div>
      {node.children && node.children.length > 0 && (
        <div className={depth === 0 ? "mt-4 grid gap-3 md:grid-cols-2" : "space-y-2"}>
          {node.children.map((c, i) => <MindMapTree key={i} node={c} depth={depth + 1} />)}
        </div>
      )}
    </div>
  );
}
