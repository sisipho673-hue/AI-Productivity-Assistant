import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Briefcase, Loader2, Sparkles } from "lucide-react";
import { generateJobDescription } from "@/lib/hr.functions";
import { PageHeader } from "@/components/page-header";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AiOutput } from "@/components/ai-output";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/job-description")({ component: JdPage });

const SENIORITY = ["Intern", "Junior", "Mid-level", "Senior", "Lead", "Manager", "Director", "Executive"];
const TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];
const TONES = ["Professional", "Inclusive & warm", "Startup energetic", "Formal corporate"];

function JdPage() {
  const fn = useServerFn(generateJobDescription);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [seniority, setSeniority] = useState(SENIORITY[2]);
  const [employmentType, setEmploymentType] = useState(TYPES[0]);
  const [location, setLocation] = useState("Remote");
  const [responsibilities, setResponsibilities] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [niceToHaves, setNiceToHaves] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [companyBlurb, setCompanyBlurb] = useState("");
  const [tone, setTone] = useState(TONES[1]);
  const [text, setText] = useState("");

  const m = useMutation({
    mutationFn: () =>
      fn({
        data: {
          title,
          department,
          seniority,
          employmentType,
          location,
          responsibilities,
          requiredSkills,
          niceToHaves,
          salaryRange,
          companyBlurb,
          tone,
        },
      }),
    onSuccess: (d) => setText(d.text),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        icon={Briefcase}
        title="Job Description Generator"
        description="Draft polished, inclusive job descriptions in seconds."
      />
      <AiDisclaimer />
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="title">Role title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Product Designer" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dept">Department</Label>
              <Input id="dept" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Design" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loc">Location / remote</Label>
              <Input id="loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote (EU) or Hybrid – London" />
            </div>
            <div className="space-y-1.5">
              <Label>Seniority</Label>
              <Select value={seniority} onValueChange={setSeniority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SENIORITY.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Employment type</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="salary">Salary range (optional)</Label>
              <Input id="salary" value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="€60k – €80k + equity" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resp">Key responsibilities (optional)</Label>
            <Textarea id="resp" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} placeholder="Bullet points or free text — the AI will polish them" className="min-h-[90px]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="req">Required skills</Label>
              <Textarea id="req" value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} placeholder="Figma, design systems, 5+ years..." className="min-h-[90px]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nice">Nice to have</Label>
              <Textarea id="nice" value={niceToHaves} onChange={(e) => setNiceToHaves(e.target.value)} placeholder="Motion design, B2B SaaS..." className="min-h-[90px]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="blurb">Company blurb (optional)</Label>
            <Textarea id="blurb" value={companyBlurb} onChange={(e) => setCompanyBlurb(e.target.value)} placeholder="1–2 sentences about your company" className="min-h-[70px]" />
          </div>
          <Button className="w-full" disabled={m.isPending || !title} onClick={() => m.mutate()}>
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate job description
          </Button>
        </div>
        <div>
          {text ? <AiOutput text={text} onChange={setText} /> : (
            <div className="rounded-2xl border border-dashed bg-card/50 p-10 text-center text-sm text-muted-foreground h-full grid place-items-center">
              Your generated job description will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}