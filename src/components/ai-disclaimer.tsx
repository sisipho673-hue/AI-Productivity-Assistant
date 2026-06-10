import { AlertTriangle } from "lucide-react";

export function AiDisclaimer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-[color-mix(in_oklab,var(--warning)_40%,transparent)] bg-[color-mix(in_oklab,var(--warning)_15%,transparent)] p-3 text-xs text-foreground/80">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--warning-foreground)" }} />
      <div>
        {children ?? (
          <>
            <strong>AI disclaimer:</strong> Outputs are AI-generated and may be inaccurate or biased.
            Always review with a qualified HR professional before acting — especially for legal,
            disciplinary, or employment decisions. Do not include sensitive employee data.
          </>
        )}
      </div>
    </div>
  );
}