import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MODEL = "google/gemini-3-flash-preview";

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

async function runPrompt(system: string, user: string) {
  const { text } = await generateText({
    model: gateway()(MODEL),
    system,
    prompt: user,
  });
  return text;
}

const EmailInput = z.object({
  emailType: z.string().min(1).max(100),
  audience: z.string().min(1).max(100),
  tone: z.string().min(1).max(50),
  subject: z.string().min(1).max(300),
  context: z.string().max(4000).optional().default(""),
});

export const generateHrEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an expert HR communication assistant. Write professional, clear, bias-free HR emails. Always include subject line, greeting, body, and sign-off. Avoid legal advice or discriminatory language.`;
    const prompt = `Draft an HR email.\nType: ${data.emailType}\nAudience: ${data.audience}\nTone: ${data.tone}\nSubject/Topic: ${data.subject}\nContext: ${data.context || "(none)"}\n\nReturn the full email in markdown.`;
    return { text: await runPrompt(system, prompt) };
  });

const NotesInput = z.object({
  notes: z.string().min(20).max(20000),
});

export const summarizeMeetingNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => NotesInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an HR meeting analyst. Summarize HR meeting notes into a concise structured report.`;
    const prompt = `Summarize the following HR meeting notes. Return markdown with these sections:\n\n## Summary\n## Key Decisions\n## Action Items (with owner & deadline if mentioned)\n## Employee Concerns\n## Compliance / Legal Flags\n## Follow-up Tasks\n\nNotes:\n${data.notes}`;
    return { text: await runPrompt(system, prompt) };
  });

const PlanInput = z.object({
  horizon: z.enum(["daily", "weekly", "monthly"]),
  focusAreas: z.string().min(1).max(2000),
  context: z.string().max(2000).optional().default(""),
});

export const generateTaskPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PlanInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an HR productivity coach. Create realistic, prioritized HR work plans.`;
    const prompt = `Create a ${data.horizon} HR work plan.\nFocus areas: ${data.focusAreas}\nAdditional context: ${data.context || "(none)"}\n\nReturn markdown with prioritized tasks, time blocks, and workflow tips. Cover recruitment, interviews, onboarding, training, and engagement where relevant.`;
    return { text: await runPrompt(system, prompt) };
  });

const ResearchInput = z.object({
  topic: z.string().min(3).max(500),
  region: z.string().max(100).optional().default(""),
});

export const hrResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an HR research assistant. Summarize HR topics, labor law, engagement and wellness practices clearly. Always remind the reader to verify legal/regulatory details with qualified counsel.`;
    const prompt = `Topic: ${data.topic}\nRegion / Context: ${data.region || "(general)"}\n\nReturn markdown with:\n## Overview\n## Key Insights\n## Best Practices\n## Recommendations for HR Teams\n## Caveats & Things to Verify`;
    return { text: await runPrompt(system, prompt) };
  });

// --- Chat threads ---

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_threads")
      .select("id, title, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { threads: data ?? [] };
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_threads")
      .insert({ user_id: context.userId, title: "New conversation" })
      .select("id, title, updated_at")
      .single();
    if (error) throw new Error(error.message);
    return { thread: data };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string }) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("chat_threads")
      .delete()
      .eq("id", data.threadId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string; title: string }) =>
    z.object({ threadId: z.string().uuid(), title: z.string().min(1).max(120) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("chat_threads")
      .update({ title: data.title })
      .eq("id", data.threadId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const loadThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { threadId: string }) => z.object({ threadId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return { messages: rows ?? [] };
  });

const ChatTurnInput = z.object({
  threadId: z.string().uuid(),
  message: z.string().min(1).max(8000),
});

export const sendChatTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ChatTurnInput.parse(d))
  .handler(async ({ data, context }) => {
    // Verify ownership and load history
    const { data: thread, error: tErr } = await context.supabase
      .from("chat_threads")
      .select("id, title")
      .eq("id", data.threadId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!thread) throw new Error("Thread not found");

    const { data: history, error: hErr } = await context.supabase
      .from("chat_messages")
      .select("role, content")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (hErr) throw new Error(hErr.message);

    // Insert user message
    const { error: uErr } = await context.supabase.from("chat_messages").insert({
      thread_id: data.threadId,
      user_id: context.userId,
      role: "user",
      content: data.message,
    });
    if (uErr) throw new Error(uErr.message);

    const systemPrompt = `You are the AI HR Committee Assistant, a virtual HR helper for HR teams and employees. Answer questions about company policies, leave procedures, onboarding, recruitment, performance, training, and workplace wellbeing. Be concise, professional, empathetic, and bias-aware. For legal, disciplinary, or compensation decisions, remind the user to involve qualified HR professionals or counsel. Never expose private employee data. Use markdown formatting.`;

    const messages = [
      ...(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: data.message },
    ];

    const { text } = await generateText({
      model: gateway()(MODEL),
      system: systemPrompt,
      messages,
    });

    // Save assistant reply
    const { error: aErr } = await context.supabase.from("chat_messages").insert({
      thread_id: data.threadId,
      user_id: context.userId,
      role: "assistant",
      content: text,
    });
    if (aErr) throw new Error(aErr.message);

    // Update thread title from first user message if still default
    let newTitle = thread.title;
    if (thread.title === "New conversation") {
      newTitle = data.message.slice(0, 60);
      await context.supabase
        .from("chat_threads")
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq("id", data.threadId);
    } else {
      await context.supabase
        .from("chat_threads")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", data.threadId);
    }

    return { reply: text, title: newTitle };
  });