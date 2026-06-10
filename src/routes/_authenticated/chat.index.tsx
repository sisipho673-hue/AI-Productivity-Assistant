import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/")({ component: Empty });

function Empty() {
  return (
    <div className="h-full grid place-items-center text-center px-6">
      <div>
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[var(--gradient-primary)] text-primary-foreground grid place-items-center shadow-[var(--shadow-elegant)]">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">AI HR Chatbot</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Start a new conversation or pick an existing one from the sidebar. Ask about policies, leave, onboarding, recruitment, or any HR topic.
        </p>
      </div>
    </div>
  );
}