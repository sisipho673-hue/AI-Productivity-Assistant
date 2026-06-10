import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { summarizeMeetingNotes } from "@/lib/hr.functions";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/notes")({ component: NotesPage });

function NotesPage() {
  const fn = useServerFn(summarizeMeetingNotes);
  const [notes, setNotes] = useState("");
  const [text, setText] = useState("");
  const m = useMutation({
    mutationFn: () => fn({ data: { notes } }),
    onSuccess: (d) => setText(d.text),
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" description="Turn raw HR meeting notes into structured summaries with action items and compliance flags." />
      <AiDisclaimer />
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Paste raw meeting notes here..." className="min-h-[340px]" />
          <Button className="w-full" disabled={m.isPending || notes.length < 20} onClick={() => m.mutate()}>
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Summarize
          </Button>
        </div>
        <div>
          {text ? <AiOutput text={text} onChange={setText} /> : (
            <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center text-sm text-muted-foreground h-full grid place-items-center">
              Summary, action items, and compliance flags will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}