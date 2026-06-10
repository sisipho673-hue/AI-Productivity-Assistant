import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2, Sparkles } from "lucide-react";
import { generateHrEmail } from "@/lib/hr.functions";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/email")({ component: EmailPage });

const TYPES = ["Recruitment outreach", "Interview invitation", "Offer letter", "Onboarding welcome", "Performance review", "Policy update", "Disciplinary notice", "Meeting invitation", "General announcement"];
const AUDIENCES = ["Candidates", "Employees", "Managers", "Executives", "All staff"];
const TONES = ["Formal", "Professional", "Friendly", "Empathetic", "Direct"];

function EmailPage() {
  const fn = useServerFn(generateHrEmail);
  const [emailType, setType] = useState(TYPES[0]);
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [tone, setTone] = useState(TONES[1]);
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [text, setText] = useState("");

  const m = useMutation({
    mutationFn: () => fn({ data: { emailType, audience, tone, subject, context } }),
    onSuccess: (d) => setText(d.text),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader icon={Mail} title="HR Email Generator" description="Generate professional HR emails tailored by tone, audience, and topic." />
      <AiDisclaimer />
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email type</Label>
              <Select value={emailType} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AUDIENCES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subj">Subject / topic</Label>
            <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Q3 performance review schedule" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ctx">Additional context (optional)</Label>
            <Textarea id="ctx" value={context} onChange={(e) => setContext(e.target.value)} placeholder="Anything specific to include: names, dates, key points (avoid sensitive employee data)" className="min-h-[120px]" />
          </div>
          <Button className="w-full" disabled={m.isPending || !subject} onClick={() => m.mutate()}>
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate email
          </Button>
        </div>
        <div>
          {text ? <AiOutput text={text} onChange={setText} /> : (
            <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center text-sm text-muted-foreground h-full grid place-items-center">
              Your generated email will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}