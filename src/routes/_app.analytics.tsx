import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { useTranscripts, useMetrics, useCategoryDist } from "@/lib/transcript-store";
import { EmptyState } from "@/components/upload-zone";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "AI Analytics · Sentinel AI" }] }),
  component: Analytics,
});

function Analytics() {
  const transcripts = useTranscripts((s) => s.transcripts);
  const m = useMetrics();
  const categories = useCategoryDist();

  if (transcripts.length === 0) return (<><TopBar title="AI Analytics" /><div className="p-6"><EmptyState /></div></>);

  const topCategory = categories[0]?.name ?? "—";
  const negPct = m.total ? Math.round((m.negative / m.total) * 100) : 0;
  const urgPct = m.total ? Math.round((m.urgent / m.total) * 100) : 0;

  // Reason-frequency analysis
  const reasonMap = new Map<string, number>();
  for (const t of transcripts) for (const r of t.priorityReasons) reasonMap.set(r, (reasonMap.get(r) ?? 0) + 1);
  const topReasons = Array.from(reasonMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Trend by upload order
  const sorted = [...transcripts].sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
  const buckets = Math.min(10, sorted.length);
  const size = Math.ceil(sorted.length / buckets);
  const trend = Array.from({ length: buckets }, (_, i) => {
    const slice = sorted.slice(i * size, (i + 1) * size);
    return {
      bucket: `B${i + 1}`,
      escalations: slice.filter((t) => t.priority === "URGENT").length,
      complaints: slice.filter((t) => t.category === "Complaint" || t.sentiment === "Negative").length,
    };
  });

  return (
    <>
      <TopBar title="AI Analytics" subtitle={`Insights derived from ${m.total} transcript${m.total > 1 ? "s" : ""}`} />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Most Common Category" value={topCategory} />
          <Stat label="Negative Sentiment %" value={`${negPct}%`} tone="critical" />
          <Stat label="Urgent Call %" value={`${urgPct}%`} tone="warning" />
          <Stat label="Avg Priority Score" value={m.avgPriority} tone="primary" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Top Recurring Issues" subtitle="Detected escalation triggers across transcripts">
            <BarChart data={topReasons} layout="vertical">
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false}/>
              <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={10} width={160}/>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
              <Bar dataKey="value" fill="var(--critical)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </Panel>

          <Panel title="Escalation & Complaint Trend" subtitle="Across upload batches">
            <LineChart data={trend}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="bucket" stroke="var(--muted-foreground)" fontSize={11}/>
              <YAxis stroke="var(--muted-foreground)" fontSize={11} allowDecimals={false}/>
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
              <Line type="monotone" dataKey="escalations" stroke="var(--critical)" strokeWidth={2.5} dot={{ r: 3 }}/>
              <Line type="monotone" dataKey="complaints" stroke="var(--warning)" strokeWidth={2.5} dot={{ r: 3 }}/>
            </LineChart>
          </Panel>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, tone = "muted" }: { label: string; value: string | number; tone?: "muted" | "critical" | "warning" | "primary" }) {
  const tones = { muted: "", critical: "text-critical", warning: "text-warning", primary: "text-primary" };
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactElement }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-3 h-72"><ResponsiveContainer>{children}</ResponsiveContainer></div>
    </div>
  );
}
