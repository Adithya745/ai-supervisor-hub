import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { calls, type Call } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Search, Filter, ArrowUpDown, MoreHorizontal, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/command-center")({
  head: () => ({ meta: [{ title: "Command Center · Sentinel AI" }] }),
  component: CommandCenter,
});

const priorityOrder = { urgent: 0, medium: 1, low: 2 };

function CommandCenter() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "urgent" | "medium" | "low">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return calls
      .filter((c) => (filter === "all" ? true : c.priority === filter))
      .filter((c) => !q || (c.id + c.customer + c.issue + c.category + c.agent).toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [q, filter]);

  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  return (
    <>
      <TopBar title="AI Supervisor Command Center" subtitle="Real-time call queue · Urgent items float to the top" />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search call ID, customer, issue, agent…" className="h-9 pl-9 bg-card" />
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
            {(["all", "urgent", "medium", "low"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded px-3 py-1 text-xs font-medium capitalize transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
            ))}
          </div>
          <Button variant="outline" size="sm"><Filter className="mr-1.5 h-3.5 w-3.5"/>Filters</Button>
          <Button variant="outline" size="sm"><ArrowUpDown className="mr-1.5 h-3.5 w-3.5"/>Sort</Button>
          <div className="flex-1" />
          {selected.size > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-1.5">
              <span className="text-xs font-medium">{selected.size} selected</span>
              <Button size="sm" className="h-7 gradient-primary text-primary-foreground" onClick={() => { toast.success(`Escalated ${selected.size} calls to Tier-2`); setSelected(new Set()); }}>Escalate</Button>
              <Button size="sm" variant="outline" className="h-7" onClick={() => { toast("Bulk action scheduled"); setSelected(new Set()); }}>Assign</Button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="w-10 px-3 py-3"><Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={(v) => setSelected(v ? new Set(filtered.map((c) => c.id)) : new Set())} /></th>
                <th className="px-3 py-3 text-left font-semibold">Call ID</th>
                <th className="px-3 py-3 text-left font-semibold">Customer Issue</th>
                <th className="px-3 py-3 text-left font-semibold">Sentiment</th>
                <th className="px-3 py-3 text-left font-semibold">Category</th>
                <th className="px-3 py-3 text-left font-semibold">Priority</th>
                <th className="px-3 py-3 text-left font-semibold">Agent</th>
                <th className="px-3 py-3 text-left font-semibold">Escalation</th>
                <th className="px-3 py-3 text-left font-semibold">Recommended Action</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => <Row key={c.id} c={c} selected={selected.has(c.id)} onToggle={() => toggle(c.id)} />)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Row({ c, selected, onToggle }: { c: Call; selected: boolean; onToggle: () => void }) {
  const sentMap = { positive: "bg-success/15 text-success", neutral: "bg-muted text-muted-foreground", negative: "bg-critical/15 text-critical" };
  const escMap: Record<string, string> = { escalated: "bg-critical/15 text-critical", pending: "bg-warning/15 text-warning", in_progress: "bg-primary/15 text-primary", resolved: "bg-success/15 text-success" };
  const urgent = c.priority === "urgent";
  return (
    <tr className={`border-t border-border transition hover:bg-muted/30 ${urgent ? "bg-critical/[0.03]" : ""}`}>
      <td className="px-3 py-3"><Checkbox checked={selected} onCheckedChange={onToggle}/></td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          {urgent && <span className="h-2 w-2 animate-pulse rounded-full bg-critical" />}
          <Link to="/calls/$id" params={{ id: c.id }} className="font-mono text-xs font-semibold text-primary hover:underline">{c.id}</Link>
        </div>
      </td>
      <td className="px-3 py-3 max-w-xs"><div className="truncate">{c.issue}</div><div className="text-[11px] text-muted-foreground">{c.customer}</div></td>
      <td className="px-3 py-3"><span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold capitalize ${sentMap[c.sentiment]}`}>{c.sentiment} · {Math.round(c.sentimentScore * 100)}%</span></td>
      <td className="px-3 py-3 text-muted-foreground">{c.category}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c.priority === "urgent" ? "bg-critical/15 text-critical" : c.priority === "medium" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{c.priority}</span>
          <span className="text-[11px] text-muted-foreground">{c.priorityScore}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-muted-foreground">{c.agent}</td>
      <td className="px-3 py-3"><span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold capitalize ${escMap[c.escalation]}`}>{c.escalation.replace("_", " ")}</span></td>
      <td className="px-3 py-3 max-w-xs text-[12px] text-muted-foreground"><div className="truncate">{c.recommendedAction}</div></td>
      <td className="px-3 py-3"><button className="text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4"/></button></td>
    </tr>
  );
}
