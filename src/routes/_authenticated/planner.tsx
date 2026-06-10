import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarCheck, Loader2, Sparkles } from "lucide-react";
import { generateTaskPlan } from "@/lib/hr.functions";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/planner")({ component: PlannerPage });

function PlannerPage() {
  const fn = useServerFn(generateTaskPlan);
  const [horizon, setHorizon] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [focus, setFocus] = useState("");
  const [context, setContext] = useState("");
  const [text, setText] = useState("");
  const m = useMutation({
    mutationFn: () => fn({ data: { horizon, focusAreas: focus, context } }),
    onSuccess: (d) => setText(d.text),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <PageHeader icon={CalendarCheck} title="Task Planner & Scheduler" description="Generate prioritized HR work plans with time blocks and workflow tips." />
      <AiDisclaimer />
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
          <div className="space-y-1.5">
            <Label>Horizon</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as typeof horizon)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Focus areas</Label>
            <Textarea value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. close 3 engineering hires, run onboarding for 2 new hires, prep Q3 engagement survey" className="min-h-[120px]" />
          </div>
          <div className="space-y-1.5">
            <Label>Context (optional)</Label>
            <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Constraints, team size, deadlines..." className="min-h-[80px]" />
          </div>
          <Button className="w-full" disabled={m.isPending || !focus} onClick={() => m.mutate()}>
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate plan
          </Button>
        </div>
        <div>
          {text ? <AiOutput text={text} onChange={setText} /> : (
            <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center text-sm text-muted-foreground h-full grid place-items-center">
              Your HR work plan will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}