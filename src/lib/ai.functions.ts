import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAi, callAiJson } from "./ai-gateway.server";

const SourceInput = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().max(120).optional().default(""),
  source: z.string().min(20).max(20000),
});

/* ---------------- NOTES ---------------- */
export const generateNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SourceInput.parse(input))
  .handler(async ({ data, context }) => {
    const prompt = `You are Lumiora's AI Notes generator. Turn the study material below into clear, exam-focused structured notes.
Return JSON of shape:
{
  "summary": "2-3 sentence overview",
  "sections": [ { "heading": "string", "bullets": ["string", ...], "key_terms": [{"term":"...","definition":"..."}] } ]
}
Keep bullets concise and useful for revision. Subject: ${data.subject || "general"}.
MATERIAL:
${data.source}`;
    const content = await callAiJson<{ summary: string; sections: unknown[] }>({
      messages: [
        { role: "system", content: "You produce accurate, well-structured study notes as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const { data: row, error } = await context.supabase
      .from("generations")
      .insert({ user_id: context.userId, type: "notes", title: data.title, subject: data.subject, source_text: data.source, content })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, content };
  });

/* ---------------- FLASHCARDS ---------------- */
export const generateFlashcards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SourceInput.extend({ count: z.number().int().min(4).max(30).default(12) }).parse(input))
  .handler(async ({ data, context }) => {
    const prompt = `Generate ${data.count} high-quality flashcards from the material. Return JSON:
{ "cards": [ { "front": "question / prompt", "back": "concise answer", "difficulty": "easy|medium|hard" } ] }
Cover the most exam-important concepts. Subject: ${data.subject || "general"}.
MATERIAL:
${data.source}`;
    const content = await callAiJson<{ cards: unknown[] }>({
      messages: [
        { role: "system", content: "You produce accurate spaced-repetition flashcards as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const { data: row, error } = await context.supabase
      .from("generations")
      .insert({ user_id: context.userId, type: "flashcards", title: data.title, subject: data.subject, source_text: data.source, content })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, content };
  });

/* ---------------- QUIZ ---------------- */
export const generateQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    SourceInput.extend({
      count: z.number().int().min(3).max(20).default(8),
      difficulty: z.enum(["easy", "medium", "hard", "mixed"]).default("mixed"),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const prompt = `Create a ${data.difficulty} multiple-choice quiz of ${data.count} questions from the material.
Return JSON:
{ "questions": [ { "q": "...", "choices": ["A","B","C","D"], "answer_index": 0, "explanation": "why this is correct" } ] }
Every question must have exactly 4 plausible choices. Subject: ${data.subject || "general"}.
MATERIAL:
${data.source}`;
    const content = await callAiJson<{ questions: unknown[] }>({
      messages: [
        { role: "system", content: "You produce accurate exam-quality quizzes as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const { data: row, error } = await context.supabase
      .from("generations")
      .insert({ user_id: context.userId, type: "quiz", title: data.title, subject: data.subject, source_text: data.source, content })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, content };
  });

/* ---------------- MIND MAP ---------------- */
export const generateMindMap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SourceInput.parse(input))
  .handler(async ({ data, context }) => {
    const prompt = `Create a hierarchical mind map from the material.
Return JSON:
{ "root": { "label": "central concept", "children": [ { "label": "branch", "children": [ { "label": "leaf" } ] } ] } }
Depth 2-3 levels. Keep labels short (max 5 words). Subject: ${data.subject || "general"}.
MATERIAL:
${data.source}`;
    const content = await callAiJson<{ root: unknown }>({
      messages: [
        { role: "system", content: "You produce clean hierarchical mind maps as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const { data: row, error } = await context.supabase
      .from("generations")
      .insert({ user_id: context.userId, type: "mindmap", title: data.title, subject: data.subject, source_text: data.source, content })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, content };
  });

/* ---------------- TUTOR CHAT ---------------- */
const ChatInput = z.object({
  thread_id: z.string().uuid().nullable().optional(),
  message: z.string().min(1).max(4000),
  mode: z.enum(["tutor", "gossip", "brainrot"]).default("tutor"),
});

const SYSTEMS: Record<"tutor" | "gossip" | "brainrot", string> = {
  tutor:
    "You are Lumiora, the official AI Tutor of Nexus Studios. You are a patient, warm teacher and study companion. Teach concepts clearly with short paragraphs, examples, and check-your-understanding questions. Encourage curiosity. Be concise unless deep detail is requested.",
  gossip:
    "You are the AI Gossip Tutor of Nexus Studios. Transform the concept into an entertaining fictional friend-conversation while preserving academic accuracy. Use two named characters chatting. Keep facts correct.",
  brainrot:
    "You are the AI Brainrot Tutor. Explain concepts using playful Gen-Z slang, memes and internet humor while keeping the underlying facts precise and exam-safe. Keep responses lively and short.",
};

export const sendTutorMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data, context }) => {
    let threadId = data.thread_id ?? null;
    if (!threadId) {
      const title = data.message.slice(0, 60);
      const { data: t, error } = await context.supabase
        .from("chat_threads")
        .insert({ user_id: context.userId, title, mode: data.mode })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      threadId = t.id;
    }

    // Save the user message
    await context.supabase.from("chat_messages").insert({
      thread_id: threadId, user_id: context.userId, role: "user", content: data.message,
    });

    // Load recent history for context (last 20)
    const { data: history } = await context.supabase
      .from("chat_messages")
      .select("role, content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEMS[data.mode] },
      ...(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ];

    const reply = await callAi<string>({ messages });

    await context.supabase.from("chat_messages").insert({
      thread_id: threadId, user_id: context.userId, role: "assistant", content: reply,
    });
    await context.supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);

    return { thread_id: threadId, reply };
  });

// Type re-import to keep tree-shaking happy
type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
