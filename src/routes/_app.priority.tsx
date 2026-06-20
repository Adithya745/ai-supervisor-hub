import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { useTranscripts } from "@/lib/transcript-store";
import { EmptyState } from "@/components/upload-zone";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/priority")({
  head: () => ({ meta: [{ title: "Priority Monitor · Sentinel AI" }] }),
  component: PriorityPage,
});

function PriorityPage() {
  const urgent = useTranscripts((s) => s.transcripts.filter((t) => t.priority === "URGENT")).sort((a, b) => b.priorityScore - a.priorityScore);

  return (
    <>
      <TopBar title="Priority Monitor" subtitle="Urgent escalations across all uploaded transcripts" />
      <div className="space-y-4 p-6">
        <div className="flex items-center gap-2 rounded-lg border border-critical/30 bg-critical/5 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-critical" />
          <span className="text-sm font-medium">{urgent.length} urgent transcript{urgent.length === 1 ? "" : "s"} require immediate action</span>
        </div>

        {urgent.length === 0 ? (
          <EmptyState title="No urgent escalations" hint="Upload transcripts; any flagged URGENT will appear here automatically." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {urgent.map((t) => (
              <Link key={t.id} to="/calls/$id" params={{ id: t.id }}
                className="pulse-critical block rounded-xl border border-critical/30 bg-card p-5 transition hover:border-critical/60 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-critical">{t.filename}</span>
                  <span className="rounded bg-critical/15 px-2 py-0.5 text-[10px] font-bold uppercase text-critical">Score {t.priorityScore}</span>
                </div>
                <div className="mt-3 text-sm font-semibold leading-snug">{t.summary}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{t.category}</span>
                  <span className="rounded bg-critical/15 px-1.5 py-0.5 font-medium text-critical">{t.sentiment} · {Math.round(t.sentimentConfidence * 100)}%</span>
                </div>
                {t.priorityReasons.length > 0 && (
                  <ul className="mt-3 space-y-1 border-t border-border pt-2 text-[11px] text-muted-foreground">
                    {t.priorityReasons.slice(0, 3).map((r, i) => <li key={i}>• {r}</li>)}
                  </ul>
                )}
                <div className="mt-3 rounded-md border border-critical/20 bg-critical/5 p-2 text-[12px]">
                  <span className="font-semibold text-critical">Next:</span> <span className="text-foreground/90">{t.recommendation}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
