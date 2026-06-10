import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Pencil, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AiOutput({ text, onChange }: { text: string; onChange?: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }
  return (
    <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">AI output</span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
            {editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={copy}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="p-5">
        {editing && onChange ? (
          <Textarea
            value={text}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground/90">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}