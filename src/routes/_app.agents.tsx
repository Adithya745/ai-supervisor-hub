import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { agents_data } from "@/lib/mock-data";
import { Trophy, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/agents")({
  head: () => ({ meta: [{ title: "Agent Performance · Sentinel AI" }] }),
  component: Agents,
});

function Agents() {
  const sorted = [...agents_data].sort((a, b) => b.quality - a.quality);
  return (
    <>
      <TopBar title="Agent Performance" subtitle="Leaderboard of agents ranked by AI-assessed quality" />
      <div className="space-y-6 p-6">
        {/* Podium */}
        <div className="grid gap-4 sm:grid-cols-3">
          {sorted.slice(0, 3).map((a, i) => (
            <div key={a.name} className={`rounded-xl border p-5 ${i === 0 ? "border-warning/40 bg-gradient-to-br from-warning/10 to-transparent" : "border-border bg-card"}`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12"><AvatarFallback className={`text-sm font-bold ${i === 0 ? "bg-warning/20 text-warning" : "bg-primary/15 text-primary"}`}>{a.name.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="truncate font-semibold">{a.name}</span>{i === 0 && <Trophy className="h-4 w-4 text-warning"/>}</div>
                  <div className="text-xs text-muted-foreground">Rank #{i + 1}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gradient">{a.quality}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Quality</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div><div className="text-sm font-semibold">{a.calls}</div><div className="text-[10px] text-muted-foreground">Calls</div></div>
                <div><div className="text-sm font-semibold text-success">{Math.round(a.sentiment * 100)}%</div><div className="text-[10px] text-muted-foreground">Sentiment</div></div>
                <div><div className="text-sm font-semibold text-warning">{a.escalations}</div><div className="text-[10px] text-muted-foreground">Escalated</div></div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold">Full Leaderboard</h3>
            <p className="text-xs text-muted-foreground">All agents ranked by composite quality score</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-2.5 text-left font-semibold">Rank</th><th className="px-4 py-2.5 text-left font-semibold">Agent</th><th className="px-4 py-2.5 text-left font-semibold">Calls</th><th className="px-4 py-2.5 text-left font-semibold">Avg Sentiment</th><th className="px-4 py-2.5 text-left font-semibold">Escalations</th><th className="px-4 py-2.5 text-left font-semibold">Resolution Quality</th></tr>
            </thead>
            <tbody>
              {sorted.map((a, i) => (
                <tr key={a.name} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-muted-foreground">#{i + 1}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/15 text-[10px] font-bold text-primary">{a.name.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>{a.name}</div></td>
                  <td className="px-4 py-3">{a.calls}</td>
                  <td className="px-4 py-3"><span className={a.sentiment >= 0.75 ? "text-success" : "text-warning"}>{a.sentiment.toFixed(2)}</span></td>
                  <td className="px-4 py-3">{a.escalations}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Progress value={a.quality} className="h-1.5 w-32" /><span className="font-semibold">{a.quality}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
