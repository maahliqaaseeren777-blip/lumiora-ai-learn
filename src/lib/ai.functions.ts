import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAi, callAiJson, type ChatMessage } from "./ai-gateway.server";
import type { Json } from "@/integrations/supabase/types";

const SourceInput = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().max(120).optional().default(""),
  source: z.string().min(20).max(20000),
});

// Cast helper — AI returns arbitrary JSON, treat as opaque Json for DB / client transport.
const asJson = (v: unknown): Json => JSON.parse(JSON.stringify(v)) as Json;

async function saveGeneration(
  ctx: { supabase: import("@supabase/supabase-js").SupabaseClient; userId: string },
  row: { type: "notes" | "flashcards" | "quiz" | "mindmap"; title: string; subject: string; source: string; content: unknown },
): Promise<string> {
  const { data, error } = await ctx.supabase
    .from("generations")
    .insert({
      user_id: ctx.userId,
      type: row.type,
      title: row.title,
      subject: row.subject,
      source_text: row.source,
      content: asJson(row.content),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

/* ---------------- NOTES ---------------- */
export const generateNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SourceInput.parse(input))
  .handler(async ({ data, context }): Promise<{ id: string; content: Json }> => {
    const prompt = `You are Lumiora's AI Notes generator. Turn the study material below into clear, exam-focused structured notes.
Return JSON:
{ "summary": "2-3 sentences", "sections": [ { "heading": "string", "bullets": ["string"], "key_terms": [{"term":"...","definition":"..."}] } ] }
Subject: ${data.subject || "general"}.
MATERIAL:
${data.source}`;
    const content = await callAiJson<Record<string, unknown>>({
      messages: [
        { role: "system", content: "You produce accurate, well-structured study notes as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const id = await saveGeneration(context, { type: "notes", title: data.title, subject: data.subject, source: data.source, content });
    return { id, content: asJson(content) };
  });

/* ---------------- FLASHCARDS ---------------- */
export const generateFlashcards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SourceInput.extend({ count: z.number().int().min(4).max(30).default(12) }).parse(input))
  .handler(async ({ data, context }): Promise<{ id: string; content: Json }> => {
    const prompt = `Generate ${data.count} flashcards from the material. Return JSON:
{ "cards": [ { "front": "prompt", "back": "concise answer", "difficulty": "easy|medium|hard" } ] }
Subject: ${data.subject || "general"}.
MATERIAL:
${data.source}`;
    const content = await callAiJson<Record<string, unknown>>({
      messages: [
        { role: "system", content: "You produce accurate spaced-repetition flashcards as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const id = await saveGeneration(context, { type: "flashcards", title: data.title, subject: data.subject, source: data.source, content });
    return { id, content: asJson(content) };
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
  .handler(async ({ data, context }): Promise<{ id: string; content: Json }> => {
    const prompt = `Create a ${data.difficulty} multiple-choice quiz of ${data.count} questions from the material.
Return JSON:
{ "questions": [ { "q": "...", "choices": ["A","B","C","D"], "answer_index": 0, "explanation": "why" } ] }
Every question needs exactly 4 plausible choices. Subject: ${data.subject || "general"}.
MATERIAL:
${data.source}`;
    const content = await callAiJson<Record<string, unknown>>({
      messages: [
        { role: "system", content: "You produce accurate exam-quality quizzes as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const id = await saveGeneration(context, { type: "quiz", title: data.title, subject: data.subject, source: data.source, content });
    return { id, content: asJson(content) };
  });

/* ---------------- MIND MAP ---------------- */
export const generateMindMap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SourceInput.parse(input))
  .handler(async ({ data, context }): Promise<{ id: string; content: Json }> => {
    const prompt = `Create a hierarchical mind map from the material.
Return JSON:
{ "root": { "label": "central concept", "children": [ { "label": "branch", "children": [ { "label": "leaf" } ] } ] } }
2-3 levels deep. Labels max 5 words. Subject: ${data.subject || "general"}.
MATERIAL:
${data.source}`;
    const content = await callAiJson<Record<string, unknown>>({
      messages: [
        { role: "system", content: "You produce clean hierarchical mind maps as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const id = await saveGeneration(context, { type: "mindmap", title: data.title, subject: data.subject, source: data.source, content });
    return { id, content: asJson(content) };
  });

/* ---------------- TUTOR CHAT ---------------- */
const ChatInput = z.object({
  thread_id: z.string().uuid().nullable().optional(),
  message: z.string().min(1).max(4000),
  mode: z.enum(["tutor", "gossip", "brainrot"]).default("tutor"),
});

const SYSTEMS: Record<"tutor" | "gossip" | "brainrot", string> = {
  tutor:
    "You are Lumiora, the official AI Tutor of Nexus Studios. You are a patient, warm teacher and study companion. Teach concepts clearly using short paragraphs, examples, and gentle check-your-understanding questions. Encourage curiosity. Be concise unless the student asks for depth.",
  gossip:
    "You are the AI Gossip Tutor of Nexus Studios. Transform the concept into an entertaining fictional friend-conversation while preserving academic accuracy. Use two named characters chatting. Keep facts correct.",
  brainrot:
    "You are the AI Brainrot Tutor. Explain concepts using playful Gen-Z slang, memes and internet humor while keeping the underlying facts precise and exam-safe. Keep it lively and short.",
};

export const sendTutorMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data, context }): Promise<{ thread_id: string; reply: string }> => {
    let threadId = data.thread_id ?? null;
    if (!threadId) {
      const title = data.message.slice(0, 60);
      const { data: t, error } = await context.supabase
        .from("chat_threads")
        .insert({ user_id: context.userId, title, mode: data.mode })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      threadId = (t as { id: string }).id;
    }

    await context.supabase.from("chat_messages").insert({
      thread_id: threadId, user_id: context.userId, role: "user", content: data.message,
    });

    const { data: history } = await context.supabase
      .from("chat_messages")
      .select("role, content")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true })
      .limit(20);

    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEMS[data.mode] },
      ...((history ?? []) as Array<{ role: string; content: string }>).map((m) => ({
        role: (m.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      })),
    ];

    const reply = await callAi<string>({ messages });

    await context.supabase.from("chat_messages").insert({
      thread_id: threadId, user_id: context.userId, role: "assistant", content: reply,
    });
    await context.supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);

    return { thread_id: threadId, reply };
  });
