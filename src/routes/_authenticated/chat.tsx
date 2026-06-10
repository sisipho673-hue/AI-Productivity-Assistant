import { createFileRoute, Link, Outlet, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, MessageSquare, Trash2, Loader2 } from "lucide-react";
import { createThread, deleteThread, listThreads } from "@/lib/hr.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({ component: ChatLayout });

function ChatLayout() {
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeId = pathname.startsWith("/chat/") ? pathname.split("/")[2] : null;

  const { data, isLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: () => list(),
  });

  const createMut = useMutation({
    mutationFn: () => create(),
    onSuccess: ({ thread }) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/chat/$threadId", params: { threadId: thread.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (threadId: string) => del({ data: { threadId } }),
    onSuccess: (_d, threadId) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      if (activeId === threadId) navigate({ to: "/chat" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Auto-redirect to first or new thread when landing on /chat
  useEffect(() => {
    if (pathname !== "/chat") return;
    if (isLoading) return;
    const threads = data?.threads ?? [];
    if (threads.length > 0) {
      navigate({ to: "/chat/$threadId", params: { threadId: threads[0].id }, replace: true });
    }
  }, [pathname, data, isLoading, navigate]);

  return (
    <div className="flex h-[calc(100vh-0px)] lg:h-screen">
      <div className="w-72 border-r bg-card flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Button className="w-full" onClick={() => createMut.mutate()} disabled={createMut.isPending}>
            {createMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            New conversation
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading && <div className="text-sm text-muted-foreground p-4">Loading...</div>}
          {data?.threads.length === 0 && (
            <div className="text-sm text-muted-foreground p-4 text-center">No conversations yet.</div>
          )}
          {data?.threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                activeId === t.id ? "bg-secondary text-secondary-foreground" : "hover:bg-secondary/60",
              )}
            >
              <Link
                to="/chat/$threadId"
                params={{ threadId: t.id }}
                className="flex items-center gap-2 flex-1 min-w-0"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.title || "Untitled"}</span>
              </Link>
              <button
                onClick={() => delMut.mutate(t.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}