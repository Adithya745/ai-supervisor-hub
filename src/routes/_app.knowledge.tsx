import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { useState } from "react";
import { Search, BookOpen, FileText, ChevronDown, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/knowledge")({
  head: () => ({ meta: [{ title: "RAG Knowledge Center · Sentinel AI" }] }),
  component: Knowledge,
});

const docs = [
  { name: "Escalation_Process.pdf", desc: "Tier-2 escalation criteria, SLA windows, approval matrix", chunks: 47, last: "2 days ago" },
  { name: "Complaint_Management.pdf", desc: "Procedure for negative-sentiment cases and repeat complaints", chunks: 62, last: "5 days ago" },
  { name: "Customer_Service_Playbook.pdf", desc: "Agent scripts, tone guidance, retention offers", chunks: 134, last: "1 week ago" },
  { name: "Retention_SOP.pdf", desc: "Churn-intent handling, discount authority, transfer rules", chunks: 38, last: "3 days ago" },
  { name: "Technical_Triage.pdf", desc: "Outage classification and NOC escalation flow", chunks: 51, last: "4 days ago" },
  { name: "Billing_Disputes.pdf", desc: "Refund authority levels and credit-note workflow", chunks: 29, last: "6 days ago" },
];

const sample = [
  { source: "Escalation_Process.pdf", chunk: "Any call involving billing disputes over $100 must be escalated to Tier-2 within 10 minutes of identification per policy ESC-04. The supervisor must verify customer tenure and prior contact history before authorizing refunds above $500.", score: 0.94 },
  { source: "Complaint_Management.pdf", chunk: "Negative-sentiment complaints regarding repeat issues (≥2 prior contacts) require supervisor approval before resolution to ensure customer retention and consistent decisioning across the team.", score: 0.88 },
  { source: "Retention_SOP.pdf", chunk: "Customers expressing intent to cancel must be offered the standard retention package (20% discount, 3 months) before transfer to the retention queue. Document the offer and customer response in the CRM.", score: 0.83 },
  { source: "Customer_Service_Playbook.pdf", chunk: "Refund authorization up to $500 is delegated to senior agents. Anything above requires written supervisor approval and an apology script following template AP-12.", score: 0.79 },
];

function Knowledge() {
  const [q, setQ] = useState("How should I handle a repeat billing complaint with refund demand?");
  const [results, setResults] = useState(sample);
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true, 1: true });

  return (
    <>
      <TopBar title="RAG Knowledge Center" subtitle="FAISS vector search over policy documents · Sentence Transformers embeddings" />
      <div className="space-y-6 p-6">
        {/* Query bar */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Semantic Query</span>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} className="h-11 pl-10 text-sm" placeholder="Ask the knowledge base…" />
            </div>
            <Button className="h-11 gradient-primary text-primary-foreground" onClick={() => setResults([...sample])}>Search</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Refund over $500", "Customer threatening to cancel", "Service outage NOC procedure", "Account locked recovery"].map((s) => (
              <button key={s} onClick={() => setQ(s)} className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground">{s}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Retrieved chunks */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Retrieved Chunks · Top {results.length}</h3>
              <span className="text-xs text-muted-foreground">Latency 184ms</span>
            </div>
            {results.map((r, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                <button onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-muted/30">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><BookOpen className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <div className="truncate font-mono text-xs font-semibold">{r.source}</div>
                      <div className="text-[11px] text-muted-foreground">Chunk #{i + 1} · {Math.round(r.score * 100)}% similarity</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="w-24"><Progress value={r.score * 100} className="h-1.5" /></div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition ${open[i] ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {open[i] && (
                  <div className="border-t border-border bg-background/50 p-4">
                    <p className="text-sm leading-relaxed">{r.chunk}</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span className="rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary">Used for recommendation</span>
                      <span>· Embedding cosine: {r.score.toFixed(3)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Source library */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Source Library</h3>
            <div className="mt-4 space-y-3">
              {docs.map((d) => (
                <div key={d.name} className="rounded-lg border border-border p-3 hover:border-primary/30">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate font-mono text-xs font-semibold">{d.name}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{d.desc}</p>
                  <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                    <span>{d.chunks} chunks indexed</span>
                    <span>{d.last}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
