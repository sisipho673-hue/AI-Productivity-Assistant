import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, FileText, CalendarCheck, Library, MessageSquare, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI HR Committee Assistant — AI-powered HR productivity" },
      { name: "description", content: "Draft HR emails, summarize meetings, plan tasks, research policies, and chat with an HR assistant — all powered by AI." },
      { property: "og:title", content: "AI HR Committee Assistant" },
      { property: "og:description", content: "AI-powered HR productivity dashboard for HR committees and teams." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Mail, title: "HR Email Generator", desc: "Recruitment, onboarding, reviews — multiple tones & audiences." },
  { icon: FileText, title: "Meeting Notes Summarizer", desc: "Decisions, action items, deadlines, compliance flags." },
  { icon: CalendarCheck, title: "Task Planner & Scheduler", desc: "Daily, weekly, monthly HR plans with priorities." },
  { icon: Library, title: "HR Research Assistant", desc: "Policies, labor laws, engagement & wellness insights." },
  { icon: MessageSquare, title: "AI HR Chatbot", desc: "Persistent threaded conversations for HR Q&A." },
  { icon: ShieldCheck, title: "Responsible AI", desc: "Bias-aware outputs with human-review reminders." },
];

function Landing() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)]">
      <header className="border-b border-border/60 backdrop-blur bg-background/70 sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-[var(--gradient-primary)] text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            HR Committee AI
          </Link>
          <div className="flex items-center gap-2">
            {authed ? (
              <Button asChild><Link to="/dashboard">Open dashboard</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
                <Button asChild><Link to="/auth">Get started</Link></Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-20">
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Sparkles className="h-3 w-3" /> AI-powered HR productivity
          </div>
          <h1 className="mt-6 text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            The AI assistant for modern <span className="bg-clip-text text-transparent bg-[var(--gradient-primary)]">HR committees</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Draft communications, summarize meetings, plan your week, and research policies — in one secure workspace built for HR teams.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg" className="shadow-[var(--shadow-elegant)]">
              <Link to={authed ? "/dashboard" : "/auth"}>{authed ? "Open dashboard" : "Get started free"}</Link>
            </Button>
          </div>
        </section>

        <section className="mt-24 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-secondary grid place-items-center text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        AI outputs should be reviewed by qualified HR professionals before action.
      </footer>
    </div>
  );
}
