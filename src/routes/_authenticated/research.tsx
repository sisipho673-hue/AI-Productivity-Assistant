import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Library, Loader2, Sparkles } from "lucide-react";
import { hrResearch } from "@/lib/hr.functions";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/research")({ component: ResearchPage });

function ResearchPage() {
  const fn = useServerFn(hrResearch);
  const [topic, setTopic] = useState("");
  const [region, setRegion] = useState("");
  const [text, setText] = useState("");
  const m = useMutation({
    mutationFn: () => fn({ data: { topic, region } }),
    onSuccess: (d) => setText(d.text),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader icon={Library} title="HR Research Assistant" description="Summarize HR policies, labor law updates, engagement and wellness practices." />
      <AiDisclaimer>
        <strong>Reminder:</strong> AI research is a starting point. Verify legal and regulatory details with qualified counsel before acting.
      </AiDisclaimer>
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
          <div className="space-y-1.5">
            <Label>Topic</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Remote work policy best practices" />
          </div>
          <div className="space-y-1.5">
            <Label>Region / context (optional)</Label>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. EU, California, fintech industry" />
          </div>
          <Button className="w-full" disabled={m.isPending || topic.length < 3} onClick={() => m.mutate()}>
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Research
          </Button>
        </div>
        <div>
          {text ? <AiOutput text={text} onChange={setText} /> : (
            <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center text-sm text-muted-foreground h-full grid place-items-center">
              Your research summary will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}