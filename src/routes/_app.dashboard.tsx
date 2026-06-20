import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { useTranscripts, useMetrics, usePriorityDist, useCategoryDist, useSentimentTrend } from "@/lib/transcript-store";
import { EmptyState, UploadZone } from "@/components/upload-zone";
import { Phone, AlertTriangle, AlertCircle, CheckCircle2, Smile, Frown, Gauge, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Executive Dashboard · Sentinel AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const transcripts = useTranscripts((s) => s.transcripts);
  const m = useMetrics();
  const priorityDist = usePriorityDist();
  const categoryDist = useCategoryDist();
  const sentimentTrend = useSentimentTrend();

  const cards = [
    { label: "Total Calls", value: m.total, icon: Phone, color: "text-primary", bg: "bg-primary/10" },
    { label: "Urgent Calls", value: m.urgent, icon: AlertTriangle, color: "text-critical", bg: "bg-critical/10" },
    { label: "Medium Calls", value: m.medium, icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
    { label: "Low Calls", value: m.low, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    { label: "Positive Sentiment", value: m.positive, icon: Smile, color: "text-success", bg: "bg-success/10" },
    { label: "Negative Sentiment", value: m.negative, icon: Frown, color: "text-critical", bg: "bg-critical/10" },
    { label: "Avg Priority Score", value: m.avgPriority, icon: Gauge, color: "text-primary", bg: "bg-primary/10" },
    { label: "Escalation Rate", value: `${m.escalationRate}%`, icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
  ];

  if (transcripts.length === 0) {
    return (
      <>
        <TopBar title="Executive Overview" subtitle="Real-time intelligence across all uploaded transcripts" />
        <div className="space-y-6 p-6">
          <UploadZone />
          <EmptyState />
        </div>
      </>
    );
  }

  const recent = [...transcripts].sort((a, b) => {
    const order = { URGENT: 0, MEDIUM: 1, LOW: 2 } as const;
    return order[a.priority] - order[b.priority] || b.priorityScore - a.priorityScore;
  }).slice(0, 8);

  return (
    <>
      <TopBar title="Executive Overview" subtitle={`Live analysis of ${m.total} transcript${m.total > 1 ? "s" : ""}`} />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((k) => (
            <div key={k.label} className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-md">
              <div className={`grid h-9 w-9 place-items-center rounded-lg ${k.bg} ${k.color}`}><k.icon className="h-4 w-4" /></div>
              <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold">Sentiment Distribution</h3>
            <p className="text-xs text-muted-foreground">Across upload batches</p>
            <div className="mt-3 h-64">
              <ResponsiveContainer>
                <AreaChart data={sentimentTrend}>
                  <defs>
                    <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--success)" stopOpacity={0.5}/><stop offset="95%" stopColor="var(--success)" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--critical)" stopOpacity={0.5}/><stop offset="95%" stopColor="var(--critical)" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--muted-foreground)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--muted-foreground)" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                  <Area type="monotone" dataKey="positive" stroke="var(--success)" fill="url(#gp)" />
                  <Area type="monotone" dataKey="neutral" stroke="var(--muted-foreground)" fill="url(#gu)" />
                  <Area type="monotone" dataKey="negative" stroke="var(--critical)" fill="url(#gn)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Priority Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={priorityDist} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {priorityDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Category Distribution</h3>
            <div className="mt-3 h-72">
              <ResponsiveContainer>
                <BarChart data={categoryDist} layout="vertical">
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false}/>
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false}/>
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={120}/>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4"><h3 className="text-sm font-semibold">Recent Escalations</h3><p className="text-xs text-muted-foreground">Sorted by priority · urgent first</p></div>
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-3 py-2 text-left">Call</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-left">Priority</th><th className="px-3 py-2 text-left">Action</th></tr></thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id} className={`border-t border-border ${t.priority === "URGENT" ? "bg-critical/[0.04]" : ""}`}>
                      <td className="px-3 py-2"><Link to="/calls/$id" params={{ id: t.id }} className="font-mono text-xs text-primary hover:underline">{t.id.slice(0, 10)}</Link><div className="text-[11px] text-muted-foreground truncate max-w-[180px]">{t.filename}</div></td>
                      <td className="px-3 py-2 text-muted-foreground">{t.category}</td>
                      <td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${t.priority === "URGENT" ? "bg-critical/15 text-critical" : t.priority === "MEDIUM" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{t.priority}</span></td>
                      <td className="px-3 py-2 text-[11px] text-muted-foreground"><div className="truncate max-w-[220px]">{t.recommendation}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
