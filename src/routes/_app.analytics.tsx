import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { sentimentTrend, categoryDist, priorityDist, escalationTrend, callVolume, topComplaints, agents_data } from "@/lib/mock-data";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "AI Analytics · Sentinel AI" }] }),
  component: Analytics,
});

const tooltip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 } };

function Card({ title, subtitle, children, span = "" }: { title: string; subtitle?: string; children: React.ReactNode; span?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${span}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="h-64">{children}</div>
    </div>
  );
}

function Analytics() {
  return (
    <>
      <TopBar title="AI Insights & Analytics" subtitle="Cross-channel intelligence over the last 30 days" />
      <div className="grid gap-4 p-6 lg:grid-cols-3">
        <Card title="Sentiment Distribution" subtitle="14-day trend" span="lg:col-span-2">
          <ResponsiveContainer>
            <AreaChart data={sentimentTrend}>
              <defs>
                <linearGradient id="ap" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--success)" stopOpacity={0.5}/><stop offset="95%" stopColor="var(--success)" stopOpacity={0}/></linearGradient>
                <linearGradient id="an" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--critical)" stopOpacity={0.5}/><stop offset="95%" stopColor="var(--critical)" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <Tooltip {...tooltip}/>
              <Area type="monotone" dataKey="positive" stroke="var(--success)" fill="url(#ap)" />
              <Area type="monotone" dataKey="negative" stroke="var(--critical)" fill="url(#an)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Priority Breakdown">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={priorityDist} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {priorityDist.map((e, i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip {...tooltip}/>
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }}/>
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Category Distribution">
          <ResponsiveContainer>
            <BarChart data={categoryDist} layout="vertical">
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false}/>
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={70}/>
              <Tooltip {...tooltip}/>
              <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Escalation Trend" subtitle="Weekly %">
          <ResponsiveContainer>
            <LineChart data={escalationTrend}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <Tooltip {...tooltip}/>
              <Line type="monotone" dataKey="rate" stroke="var(--warning)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--warning)" }}/>
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Daily Call Volume">
          <ResponsiveContainer>
            <BarChart data={callVolume}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <Tooltip {...tooltip}/>
              <Bar dataKey="calls" fill="var(--primary)" radius={[6, 6, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Top Complaint Types" span="lg:col-span-2">
          <ResponsiveContainer>
            <BarChart data={topComplaints}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
              <Tooltip {...tooltip}/>
              <Bar dataKey="value" fill="var(--critical)" radius={[6, 6, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Agent Performance Radar">
          <ResponsiveContainer>
            <RadarChart data={agents_data.map((a) => ({ name: a.name.split(" ")[0], quality: a.quality, sentiment: a.sentiment * 100, calls: (a.calls / 1.6) }))}>
              <PolarGrid stroke="var(--border)"/>
              <PolarAngleAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11}/>
              <Radar dataKey="quality" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3}/>
              <Tooltip {...tooltip}/>
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}
