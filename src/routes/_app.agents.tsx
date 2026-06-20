import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { useTranscripts } from "@/lib/transcript-store";
import { EmptyState } from "@/components/upload-zone";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_app/agents")({
  head: () => ({ meta: [{ title: "Agent Performance · Sentinel AI" }] }),
  component: Agents,
});

function Agents() {
  const transcripts = useTranscripts((s) => s.transcripts);

  // Group by detected agent name
  const byAgent = new Map<string, typeof transcripts>();
  for (const t of transcripts) {
    const arr = byAgent.get(t.agent) ?? [];
    arr.push(t); byAgent.set(t.agent, arr);
  }

  const rows = Array.from(byAgent.entries()).map(([name, items]) => {
    const total = items.length;
    const escalations = items.filter((t) => t.priority === "URGENT").length;
    const positive = items.filter((t) => t.sentiment === "Positive").length;
    const negative = items.filter((t) => t.sentiment === "Negative").length;
    const avgSentiment = total ? Math.round(((positive - negative) / total + 1) * 50) : 0;
    const resolved = total - escalations;
    return {
      name,
      calls: total,
      avgSentiment,
      escalationRate: total ? Math.round((escalations / total) * 1000) / 10 : 0,
      resolutionRate: total ? Math.round((resolved / total) * 1000) / 10 : 0,
    };
  }).sort((a, b) => b.calls - a.calls);

  return (
    <>
      <TopBar title="Agent Performance" subtitle="Derived from uploaded transcripts · future-ready scaffolding" />
      <div className="space-y-4 p-6">
        {transcripts.length === 0 ? (
          <EmptyState title="No agent data yet" hint="Agent metrics are extracted from transcript content. Upload calls to populate." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3 text-left">Agent</th><th className="px-4 py-3 text-left">Calls</th><th className="px-4 py-3 text-left">Avg Sentiment</th><th className="px-4 py-3 text-left">Escalation Rate</th><th className="px-4 py-3 text-left">Resolution Rate</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-t border-border">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary"><Users className="h-3.5 w-3.5" /></div><span className="font-medium">{r.name}</span></div></td>
                    <td className="px-4 py-3 font-mono">{r.calls}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"><div className="h-full bg-success" style={{ width: `${r.avgSentiment}%` }}/></div><span className="text-xs text-muted-foreground">{r.avgSentiment}</span></div></td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-semibold ${r.escalationRate > 30 ? "bg-critical/15 text-critical" : r.escalationRate > 15 ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{r.escalationRate}%</span></td>
                    <td className="px-4 py-3 font-mono text-success">{r.resolutionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
