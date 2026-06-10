import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileText, CalendarCheck, Library, MessageSquare, Sparkles } from "lucide-react";
import { AiDisclaimer } from "@/components/ai-disclaimer";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

const TILES = [
  { to: "/email", icon: Mail, title: "HR Email Generator", desc: "Draft emails for recruitment, onboarding, reviews, and more." },
  { to: "/notes", icon: FileText, title: "Meeting Notes Summarizer", desc: "Turn raw notes into action items and decisions." },
  { to: "/planner", icon: CalendarCheck, title: "Task Planner & Scheduler", desc: "Daily, weekly, or monthly HR work plans." },
  { to: "/research", icon: Library, title: "HR Research Assistant", desc: "Policies, labor laws, engagement and wellness insights." },
  { to: "/chat", icon: MessageSquare, title: "AI HR Chatbot", desc: "Threaded conversations for HR questions." },
] as const;

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-3xl bg-[var(--gradient-primary)] text-primary-foreground p-8 md:p-10 shadow-[var(--shadow-elegant)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
          <Sparkles className="h-3 w-3" /> Welcome back
        </div>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold">Your AI HR command center</h1>
        <p className="mt-2 text-primary-foreground/80 max-w-xl">
          Pick a module to draft, summarize, plan, research, or chat — all powered by AI and built for HR teams.
        </p>
      </div>

      <div className="mt-6">
        <AiDisclaimer />
      </div>

      <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="group rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-all"
          >
            <div className="h-10 w-10 rounded-lg bg-secondary text-primary grid place-items-center group-hover:bg-[var(--gradient-primary)] group-hover:text-primary-foreground transition-colors">
              <t.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">{t.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}