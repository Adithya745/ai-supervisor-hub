import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { useTranscripts } from "@/lib/transcript-store";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/_app/calls/$id")({
  head: () => ({ meta: [{ title: "Transcript Detail · Sentinel AI" }] }),
  component: CallDetail,
});

function CallDetail() {
  const { id } = useParams({ from: "/_app/calls/$id" });
  const t = useTranscripts((s) => s.transcripts.find((x) => x.id === id));

  if (!t) {
    return (
      <>
        <TopBar title="Transcript not found" />
        <div className="p-6">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">This transcript no longer exists.</p>
            <Link to="/command-center" className="mt-3 inline-flex text-sm text-primary hover:underline">← Back to Explorer</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title={t.filename} subtitle={`${t.category} · ${t.sentiment} · ${t.priority}`} />
      <div className="space-y-6 p-6">
        <Link to="/command-center" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-3 w-3" />Back to Explorer</Link>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Sentiment" value={t.sentiment} sub={`${Math.round(t.sentimentConfidence * 100)}% confidence`} tone={t.sentiment === "Negative" ? "critical" : t.sentiment === "Positive" ? "success" : "muted"} />
          <Metric label="Category" value={t.category} sub={`${Math.round(t.categoryConfidence * 100)}% confidence`} tone="primary" />
          <Metric label="Priority" value={t.priority} sub={`Score ${t.priorityScore}`} tone={t.priority === "URGENT" ? "critical" : t.priority === "MEDIUM" ? "warning" : "success"} />
          <Metric label="Duration (est.)" value={t.durationEstimate} sub={`${t.text.split(/\s+/).length} words`} tone="muted" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card lg:col-span-2">
            <div className="flex items-center gap-2 border-b border-border px-5 py-3"><FileText className="h-4 w-4 text-muted-foreground" /><h3 className="text-sm font-semibold">Full Transcript</h3></div>
            <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap p-5 text-sm leading-relaxed">{t.text}</pre>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">AI Summary</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.summary}</p>
            </div>

            <div className={`rounded-xl border p-5 ${t.priority === "URGENT" ? "border-critical/40 bg-critical/5" : "border-border bg-card"}`}>
              <div className="flex items-center gap-2"><AlertTriangle className={`h-4 w-4 ${t.priority === "URGENT" ? "text-critical" : "text-warning"}`} /><h3 className="text-sm font-semibold">Recommended Action</h3></div>
              <p className="mt-2 text-sm">{t.recommendation}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Priority Triggers</h3>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                {t.priorityReasons.map((r, i) => <li key={i} className="flex gap-2"><span className="text-primary">›</span>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: string | number; sub: string; tone: "critical" | "warning" | "success" | "primary" | "muted" }) {
  const tones = {
    critical: "border-critical/30 bg-critical/5 text-critical",
    warning: "border-warning/30 bg-warning/5 text-warning",
    success: "border-success/30 bg-success/5 text-success",
    primary: "border-primary/30 bg-primary/5 text-primary",
    muted: "border-border bg-card text-foreground",
  };
  return (
    <div className={`rounded-xl border p-5 ${tones[tone]}`}>
      <div className="text-[10px] font-medium uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
      <div className="mt-1 text-[11px] opacity-70">{sub}</div>
    </div>
  );
}
