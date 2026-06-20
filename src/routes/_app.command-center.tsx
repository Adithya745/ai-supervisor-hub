import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { useTranscripts } from "@/lib/transcript-store";
import { EmptyState } from "@/components/upload-zone";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/command-center")({
  head: () => ({ meta: [{ title: "Transcript Explorer · Sentinel AI" }] }),
  component: CommandCenter,
});

const order = { URGENT: 0, MEDIUM: 1, LOW: 2 } as const;

function CommandCenter() {
  const transcripts = useTranscripts((s) => s.transcripts);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "URGENT" | "MEDIUM" | "LOW">("all");

  const filtered = useMemo(() => transcripts
    .filter((t) => filter === "all" || t.priority === filter)
    .filter((t) => !q || (t.filename + t.category + t.text + t.sentiment).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => order[a.priority] - order[b.priority] || b.priorityScore - a.priorityScore),
    [transcripts, q, filter]);

  if (transcripts.length === 0) return (<><TopBar title="Transcript Explorer" /><div className="p-6"><EmptyState /></div></>);

  return (
    <>
      <TopBar title="Transcript Explorer" subtitle={`${filtered.length} of ${transcripts.length} transcripts`} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search filename, category, content…" className="h-9 pl-9 bg-card" />
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
            {(["all", "URGENT", "MEDIUM", "LOW"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded px-3 py-1 text-xs font-medium transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">File Name</th>
                <th className="px-3 py-3 text-left font-semibold">Category</th>
                <th className="px-3 py-3 text-left font-semibold">Sentiment</th>
                <th className="px-3 py-3 text-left font-semibold">Priority</th>
                <th className="px-3 py-3 text-left font-semibold">Confidence</th>
                <th className="px-3 py-3 text-left font-semibold">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className={`border-t border-border transition hover:bg-muted/30 ${t.priority === "URGENT" ? "bg-critical/[0.03]" : ""}`}>
                  <td className="px-3 py-3"><Link to="/calls/$id" params={{ id: t.id }} className="font-medium text-primary hover:underline">{t.filename}</Link><div className="text-[11px] text-muted-foreground">{t.customer}</div></td>
                  <td className="px-3 py-3 text-muted-foreground">{t.category}</td>
                  <td className="px-3 py-3"><span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${t.sentiment === "Negative" ? "bg-critical/15 text-critical" : t.sentiment === "Positive" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{t.sentiment} · {Math.round(t.sentimentConfidence * 100)}%</span></td>
                  <td className="px-3 py-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${t.priority === "URGENT" ? "bg-critical/15 text-critical" : t.priority === "MEDIUM" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{t.priority} · {t.priorityScore}</span></td>
                  <td className="px-3 py-3 text-muted-foreground text-xs">{Math.round(t.categoryConfidence * 100)}%</td>
                  <td className="px-3 py-3 max-w-xs text-[12px] text-muted-foreground"><div className="truncate">{t.recommendation}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
