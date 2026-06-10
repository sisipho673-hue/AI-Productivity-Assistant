import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { loadThreadMessages, sendChatTurn } from "@/lib/hr.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({ component: ChatThread });

type Msg = { id: string; role: string; content: string; created_at: string };

function ChatThread() {
  const { threadId } = Route.useParams();
  const load = useServerFn(loadThreadMessages);
  const send = useServerFn(sendChatTurn);
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["thread-messages", threadId],
    queryFn: () => load({ data: { threadId } }),
  });

  const m = useMutation({
    mutationFn: (message: string) => send({ data: { threadId, message } }),
    onSuccess: () => {
      setPendingUser(null);
      qc.invalidateQueries({ queryKey: ["thread-messages", threadId] });
      qc.invalidateQueries({ queryKey: ["threads"] });
      requestAnimationFrame(() => inputRef.current?.focus());
    },
    onError: (e: Error) => {
      setPendingUser(null);
      toast.error(e.message);
    },
  });

  const messages: Msg[] = data?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pendingUser, m.isPending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  function submit() {
    const t = input.trim();
    if (!t || m.isPending) return;
    setPendingUser(t);
    setInput("");
    m.mutate(t);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-3 bg-card/50">
        <AiDisclaimer />
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {isLoading && <div className="text-sm text-muted-foreground">Loading conversation...</div>}
          {!isLoading && messages.length === 0 && !pendingUser && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--gradient-primary)] text-primary-foreground grid place-items-center shadow-[var(--shadow-elegant)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">How can I help with HR today?</h3>
              <p className="text-sm text-muted-foreground mt-1">Try: "What should I include in a remote work policy?"</p>
            </div>
          )}
          {messages.map((msg) => <MessageBubble key={msg.id} role={msg.role} content={msg.content} />)}
          {pendingUser && <MessageBubble role="user" content={pendingUser} />}
          {m.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          )}
        </div>
      </div>
      <div className="border-t bg-background p-4">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about HR policies, leave, onboarding, recruitment..."
            className="min-h-[52px] max-h-40 resize-none"
          />
          <Button onClick={submit} disabled={m.isPending || !input.trim()} size="icon" className="h-[52px] w-[52px] shrink-0">
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
          AI responses may be inaccurate. Review with HR professionals for legal or disciplinary matters.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border text-foreground",
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-p:my-2">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}