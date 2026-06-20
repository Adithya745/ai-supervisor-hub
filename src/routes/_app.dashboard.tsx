import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { kpis, sentimentTrend, priorityDist, callVolume, escalationTrend, calls, categoryDist } from "@/lib/mock-data";
import { Phone, AlertTriangle, AlertCircle, CheckCircle2, Smile, Frown, Gauge, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Executive Dashboard · Sentinel AI" }] }),
  component: Dashboard,
});

const kpiCards = [
  { label: "Total Calls", value: kpis.totalCalls.toLocaleString(), delta: "+12.4%", up: true, icon: Phone, color: "text-primary", bg: "bg-primary/10" },
  { label: "Urgent Calls", value: kpis.urgent, delta: "+8.2%", up: true, icon: AlertTriangle, color: "text-critical", bg: "bg-critical/10" },
  { label: "Medium Calls", value: kpis.medium, delta: "-3.1%", up: false, icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
  { label: "Low Calls", value: kpis.low, delta: "+1.6%", up: true, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  { label: "Positive Sentiment", value: kpis.positiveSentiment, delta: "+5.8%", up: true, icon: Smile, color: "text-success", bg: "bg-success/10" },
  { label: "Negative Sentiment", value: kpis.negativeSentiment, delta: "-2.4%", up: false, icon: Frown, color: "text-critical", bg: "bg-critical/10" },
  { label: "Avg Priority Score", value: kpis.avgPriorityScore, delta: "+4.0%", up: true, icon: Gauge, color: "text-primary", bg: "bg-primary/10" },
  { label: "Escalation Rate", value: `${kpis.escalationRate}%`, delta: "-1.2%", up: false, icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
];

const mini = Array.from({ length: 10 }, (_, i) => ({ x: i, y: 30 + Math.round(Math.random() * 50) }));

function Dashboard() {
  const recent = calls.slice(0, 6);
  return (
    <>
      <TopBar title="Executive Overview" subtitle="Real-time intelligence across all active conversations" />
      <div className="space-y-6 p-6">
        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((k) => (
            <div key={k.label} className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${k.bg} ${k.color}`}><k.icon className="h-4.5 w-4.5" /></div>
                <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${k.up ? "bg-success/15 text-success" : "bg-critical/15 text-critical"}`}>
                  {k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />} {k.delta}
                </span>
              </div>
              <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">{k.value}</div>
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mini}>
                    <defs>
                      <linearGradient id={`g-${k.label}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="y" stroke="var(--primary)" strokeWidth={1.5} fill={`url(#g-${k.label})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Sentiment Distribution · 14 days</h3>
                <p className="text-xs text-muted-foreground">Positive / neutral / negative call sentiment over time</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
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
            <p className="text-xs text-muted-foreground">Today</p>
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

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Call Volume · 24h</h3>
            <div className="mt-4 h-56">
              <ResponsiveContainer>
                <BarChart data={callVolume}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                  <Bar dataKey="calls" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Escalation Rate · Weekly</h3>
            <div className="mt-4 h-56">
              <ResponsiveContainer>
                <LineChart data={escalationTrend}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                  <Line type="monotone" dataKey="rate" stroke="var(--warning)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--warning)" }} activeDot={{ r: 6 }}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">Category Distribution</h3>
            <div className="mt-4 h-56">
              <ResponsiveContainer>
                <BarChart data={categoryDist} layout="vertical">
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false}/>
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={70}/>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                  <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Recent Escalations</h3>
              <p className="text-xs text-muted-foreground">Latest calls flagged by the Priority Engine</p>
            </div>
            <Link to="/command-center"><Button variant="outline" size="sm">View Command Center</Button></Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-2.5 text-left font-semibold">Call</th><th className="px-4 py-2.5 text-left font-semibold">Customer</th><th className="px-4 py-2.5 text-left font-semibold">Issue</th><th className="px-4 py-2.5 text-left font-semibold">Priority</th><th className="px-4 py-2.5 text-left font-semibold">Action</th></tr>
              </thead>
              <tbody>
                {recent.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3"><Link to="/calls/$id" params={{ id: c.id }} className="font-mono text-xs font-semibold text-primary hover:underline">{c.id}</Link></td>
                    <td className="px-4 py-3">{c.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.issue}</td>
                    <td className="px-4 py-3"><PriorityChip p={c.priority} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function PriorityChip({ p }: { p: "urgent" | "medium" | "low" }) {
  const map = { urgent: "bg-critical/15 text-critical", medium: "bg-warning/15 text-warning", low: "bg-success/15 text-success" } as const;
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${map[p]}`}>{p}</span>;
}
