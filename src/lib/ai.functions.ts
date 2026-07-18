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
  row: { type: "notes" | "flashcards" | "quiz" | "mindmap" | "essay" | "podcast" | "brainrot" | "gossip" | "summary"; title: string; subject: string; source: string; content: unknown },
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

/* ---------------- ESSAY WRITER ---------------- */
export const generateEssay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    SourceInput.extend({
      length: z.enum(["short", "medium", "long"]).default("medium"),
      tone: z.enum(["academic", "casual", "persuasive", "reflective"]).default("academic"),
    }).parse(input),
  )
  .handler(async ({ data, context }): Promise<{ id: string; content: Json }> => {
    const words = data.length === "short" ? 350 : data.length === "long" ? 1100 : 650;
    const prompt = `Write a ${data.tone} essay (~${words} words) on the topic below. Return JSON:
{ "title": "string", "intro": "paragraph", "body": [ { "heading": "string", "paragraph": "string" } ], "conclusion": "paragraph" }
TOPIC / MATERIAL:\n${data.source}`;
    const content = await callAiJson<Record<string, unknown>>({
      messages: [
        { role: "system", content: "You produce clear, well-structured essays as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const id = await saveGeneration(context, { type: "essay", title: data.title, subject: data.subject, source: data.source, content });
    return { id, content: asJson(content) };
  });

/* ---------------- PODCAST SCRIPT ---------------- */
export const generatePodcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SourceInput.parse(input))
  .handler(async ({ data, context }): Promise<{ id: string; content: Json }> => {
    const prompt = `Turn the material into an engaging 2-host study podcast script (~6 minutes read time).
Return JSON:
{ "title": "string", "intro": "string", "segments": [ { "speaker": "Host A" | "Host B", "line": "string" } ], "outro": "string" }
Alternate speakers naturally, keep facts accurate, make it feel conversational.
MATERIAL:\n${data.source}`;
    const content = await callAiJson<Record<string, unknown>>({
      messages: [
        { role: "system", content: "You produce natural conversational podcast scripts as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const id = await saveGeneration(context, { type: "podcast", title: data.title, subject: data.subject, source: data.source, content });
    return { id, content: asJson(content) };
  });

/* ---------------- BRAINROT EXPLAINER ---------------- */
export const generateBrainrot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SourceInput.parse(input))
  .handler(async ({ data, context }): Promise<{ id: string; content: Json }> => {
    const prompt = `Rewrite the material as a Gen-Z "brainrot" style explainer — playful slang, memes, chaotic energy — while keeping every fact accurate and exam-safe.
Return JSON:
{ "hook": "one-line opener", "beats": ["punchy line", "..."], "tldr": "short recap" }
MATERIAL:\n${data.source}`;
    const content = await callAiJson<Record<string, unknown>>({
      messages: [
        { role: "system", content: "You produce accurate but playful Gen-Z study explainers as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const id = await saveGeneration(context, { type: "brainrot", title: data.title, subject: data.subject, source: data.source, content });
    return { id, content: asJson(content) };
  });

/* ---------------- GOSSIP EXPLAINER ---------------- */
export const generateGossip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SourceInput.parse(input))
  .handler(async ({ data, context }): Promise<{ id: string; content: Json }> => {
    const prompt = `Rewrite the material as a fictional gossip-style conversation between two friends (Mia and Zoe). Keep facts precise.
Return JSON:
{ "setup": "one line", "conversation": [ { "speaker": "Mia" | "Zoe", "line": "string" } ], "takeaway": "one line" }
MATERIAL:\n${data.source}`;
    const content = await callAiJson<Record<string, unknown>>({
      messages: [
        { role: "system", content: "You produce accurate gossip-style study dialogues as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const id = await saveGeneration(context, { type: "gossip", title: data.title, subject: data.subject, source: data.source, content });
    return { id, content: asJson(content) };
  });

/* ---------------- STUDY PLAN ---------------- */
const PlanInput = z.object({
  goal: z.string().min(3).max(200),
  subjects: z.string().max(500).default(""),
  exam_date: z.string().max(40).optional().default(""),
  hours_per_day: z.number().min(0.5).max(12).default(2),
});

export const generateStudyPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data, context }): Promise<{ id: string; content: Json }> => {
    const prompt = `Build a realistic 7-day study plan.
Goal: ${data.goal}
Subjects: ${data.subjects || "unspecified"}
Exam date: ${data.exam_date || "unspecified"}
Available time: ${data.hours_per_day} hours/day
Return JSON:
{ "overview": "1-2 sentences", "days": [ { "day": "Day 1", "focus": "topic", "blocks": [ { "time": "e.g. 30m", "task": "string" } ], "review": "string" } ], "tips": ["string"] }`;
    const content = await callAiJson<Record<string, unknown>>({
      messages: [
        { role: "system", content: "You are a study coach producing realistic weekly plans as strict JSON." },
        { role: "user", content: prompt },
      ],
    });
    const id = await saveGeneration(context, {
      type: "summary", title: data.goal.slice(0, 100), subject: data.subjects, source: JSON.stringify(data), content,
    });
    return { id, content: asJson(content) };
  });
