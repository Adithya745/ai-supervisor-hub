import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { calls, type Priority } from "@/lib/mock-data";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/priority")({
  head: () => ({ meta: [{ title: "Priority Monitor · Sentinel AI" }] }),
  component: PriorityPage,
});

const cols: { key: Priority; label: string; icon: any; color: string; ring: string }[] = [
  { key: "urgent", label: "Urgent", icon: AlertTriangle, color: "text-critical", ring: "border-critical/40" },
  { key: "medium", label: "Medium", icon: AlertCircle, color: "text-warning", ring: "border-warning/40" },
  { key: "low", label: "Low", icon: CheckCircle2, color: "text-success", ring: "border-success/40" },
];

function PriorityPage() {
  return (
    <>
      <TopBar title="Priority Monitor" subtitle="Kanban view of every active call by AI-assigned priority" />
      <div className="grid gap-4 p-6 lg:grid-cols-3">
        {cols.map((col) => {
          const items = calls.filter((c) => c.priority === col.key);
          return (
            <div key={col.key} className={`flex flex-col rounded-xl border bg-card ${col.ring}`}>
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <col.icon className={`h-4 w-4 ${col.color}`} />
                  <h3 className="text-sm font-semibold uppercase tracking-wider">{col.label}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold">{items.length}</span>
                </div>
              </div>
              <div className="flex-1 space-y-3 p-3">
                {items.map((c) => (
                  <Link key={c.id} to="/calls/$id" params={{ id: c.id }}
                    className={`block rounded-lg border border-border bg-background p-4 transition hover:border-primary/40 hover:shadow-md ${col.key === "urgent" ? "pulse-critical" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-primary">{c.id}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${col.key === "urgent" ? "bg-critical/15 text-critical" : col.key === "medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{c.priorityScore}</span>
                    </div>
                    <div className="mt-2 text-sm font-medium leading-snug">{c.issue}</div>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5">{c.category}</span>
                      <span className={`capitalize ${c.sentiment === "negative" ? "text-critical" : c.sentiment === "positive" ? "text-success" : ""}`}>{c.sentiment}</span>
                    </div>
                    <div className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Next:</span> {c.recommendedAction}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
