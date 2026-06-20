import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { FileSpreadsheet, FileText, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranscripts, useMetrics } from "@/lib/transcript-store";
import { EmptyState } from "@/components/upload-zone";

export const Route = createFileRoute("/_app/export")({
  head: () => ({ meta: [{ title: "Export Center · Sentinel AI" }] }),
  component: ExportPage,
});

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function ExportPage() {
  const transcripts = useTranscripts((s) => s.transcripts);
  const m = useMetrics();

  if (transcripts.length === 0) return (<><TopBar title="Export Center" /><div className="p-6"><EmptyState /></div></>);

  const exportCSV = () => {
    const headers = ["id", "filename", "category", "category_confidence", "sentiment", "sentiment_confidence", "priority", "priority_score", "recommendation", "customer", "agent"];
    const rows = transcripts.map((t) => [t.id, t.filename, t.category, t.categoryConfidence.toFixed(2), t.sentiment, t.sentimentConfidence.toFixed(2), t.priority, t.priorityScore, t.recommendation, t.customer, t.agent]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
    download(`sentinel-transcripts-${Date.now()}.csv`, [headers.join(","), ...rows].join("\n"), "text/csv");
    toast.success("CSV downloaded");
  };

  const exportJSON = () => {
    download(`sentinel-transcripts-${Date.now()}.json`, JSON.stringify({ metrics: m, transcripts }, null, 2), "application/json");
    toast.success("JSON downloaded");
  };

  const exportBriefing = () => {
    const urgent = transcripts.filter((t) => t.priority === "URGENT");
    const lines = [
      `SENTINEL AI — SUPERVISOR BRIEFING`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `TOTALS`,
      `  Transcripts analyzed: ${m.total}`,
      `  Urgent: ${m.urgent}  |  Medium: ${m.medium}  |  Low: ${m.low}`,
      `  Positive: ${m.positive}  |  Neutral: ${m.neutral}  |  Negative: ${m.negative}`,
      `  Avg priority score: ${m.avgPriority}   Escalation rate: ${m.escalationRate}%`,
      ``,
      `URGENT ESCALATIONS (${urgent.length})`,
      ...urgent.map((t, i) => `  ${i + 1}. [${t.priorityScore}] ${t.filename} — ${t.category}\n     ${t.summary}\n     → ${t.recommendation}`),
    ];
    download(`supervisor-briefing-${Date.now()}.txt`, lines.join("\n"), "text/plain");
    toast.success("Briefing generated");
  };

  const items = [
    { icon: FileSpreadsheet, title: "Export CSV", desc: `${m.total} records · sentiment, category, priority`, color: "text-success", bg: "bg-success/10", run: exportCSV },
    { icon: FileText, title: "Export JSON", desc: "Full structured payload with metrics & transcripts", color: "text-primary", bg: "bg-primary/10", run: exportJSON },
    { icon: FileDown, title: "Supervisor Briefing", desc: `End-of-shift report · ${m.urgent} urgent escalations`, color: "text-critical", bg: "bg-critical/10", run: exportBriefing },
  ];

  return (
    <>
      <TopBar title="Export Center" subtitle="Download live analysis results" />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${it.bg} ${it.color}`}><it.icon className="h-6 w-6" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold">{it.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{it.desc}</p>
                  <Button size="sm" className="mt-3 gradient-primary text-primary-foreground" onClick={it.run}>Download</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
