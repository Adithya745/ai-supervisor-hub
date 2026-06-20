import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { calls, type Call } from "@/lib/mock-data";
import { ArrowLeft, Sparkles, FileText, Gauge, Target, BookOpen, ListChecks, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/calls/$id")({
  head: ({ params }) => ({ meta: [{ title: `Call ${params.id} · Sentinel AI` }] }),
  loader: ({ params }) => {
    const call = calls.find((c) => c.id === params.id);
    if (!call) throw notFound();
    return { call };
  },
  notFoundComponent: () => (
    <div className="p-12 text-center text-muted-foreground">Call not found. <Link to="/command-center" className="text-primary underline">Back to queue</Link></div>
  ),
  component: CallPage,
});

function CallPage() {
  const { call: c } = Route.useLoaderData() as { call: Call };
  const sentColor = c.sentiment === "negative" ? "critical" : c.sentiment === "positive" ? "success" : "muted-foreground";

  return (
    <>
      <TopBar title={`Call ${c.id}`} subtitle={`${c.customer} · ${c.category} · ${c.duration} min`} />
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Link to="/command-center"><Button variant="ghost" size="sm"><ArrowLeft className="mr-1.5 h-3.5 w-3.5"/>Back to queue</Button></Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Assign Agent</Button>
            <Button size="sm" className="gradient-primary text-primary-foreground">Escalate to Tier-2</Button>
          </div>
        </div>

        {/* Hero banner */}
        <div className={`rounded-xl border p-5 ${c.priority === "urgent" ? "border-critical/40 bg-critical/[0.04]" : "border-border bg-card"}`}>
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex-1 min-w-[220px]">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Issue</div>
              <div className="mt-1 text-lg font-semibold">{c.issue}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Priority Score</div>
              <div className={`mt-1 text-3xl font-bold ${c.priority === "urgent" ? "text-critical" : c.priority === "medium" ? "text-warning" : "text-success"}`}>{c.priorityScore}<span className="text-base text-muted-foreground">/100</span></div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sentiment</div>
              <div className={`mt-1 text-lg font-semibold capitalize text-${sentColor}`}>{c.sentiment} <span className="text-sm text-muted-foreground">· {Math.round(c.sentimentScore*100)}%</span></div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Agent</div>
              <div className="mt-1 text-sm font-medium">{c.agent}</div>
            </div>
          </div>
        </div>

        {/* Recommended Action (prominent) */}
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-5">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg gradient-primary text-primary-foreground"><Sparkles className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Recommended Next Action</div>
              <h3 className="mt-1 text-lg font-semibold">{c.recommendedAction}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Grounded in <span className="font-medium text-foreground">{c.ragChunks[0]?.source}</span> · Confidence {Math.round(c.ragChunks[0]?.score * 100)}%</p>
            </div>
            <Button size="sm" className="gradient-primary text-primary-foreground">Apply Action</Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Transcript */}
          <Section title="Full Transcript" icon={FileText} className="lg:col-span-2">
            <div className="space-y-3">
              {c.transcript.map((t, i) => (
                <div key={i} className={`flex gap-3 ${t.speaker === "agent" ? "" : "flex-row-reverse"}`}>
                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold ${t.speaker === "agent" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{t.speaker === "agent" ? "A" : "C"}</div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${t.speaker === "agent" ? "bg-muted text-foreground" : "bg-primary/10 text-foreground"}`}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.speaker} · {t.time}</div>
                    <div className="mt-1">{t.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* AI Summary */}
          <Section title="AI Summary" icon={Sparkles}>
            <p className="text-sm leading-relaxed text-muted-foreground">{c.summary}</p>
            <div className="mt-4 space-y-2">
              {["Repeat contact ×2 in 7 days", "Explicit churn-intent language", "Refund eligibility verified"].map((b) => (
                <div key={b} className="flex items-start gap-2 text-xs"><span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />{b}</div>
              ))}
            </div>
          </Section>

          {/* Sentiment gauge */}
          <Section title="Sentiment Analysis" icon={Gauge}>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold capitalize text-${sentColor}`}>{c.sentiment}</span>
              <span className="text-sm text-muted-foreground">{Math.round(c.sentimentScore * 100)}% confidence</span>
            </div>
            <Progress value={c.sentimentScore * 100} className="mt-4 h-2" />
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground"><span>Negative</span><span>Positive</span></div>
            <div className="mt-4 rounded-md bg-muted/50 p-3 text-[11px] text-muted-foreground">
              Model: <span className="font-mono text-foreground">distilbert-base-uncased-finetuned-sst-2</span>
            </div>
          </Section>

          {/* Intent */}
          <Section title="Intent Classification" icon={Target}>
            <div className="space-y-3">
              {c.intents.map((it) => (
                <div key={it.label}>
                  <div className="flex justify-between text-xs"><span className="font-medium">{it.label}</span><span className="text-muted-foreground">{Math.round(it.score * 100)}%</span></div>
                  <Progress value={it.score * 100} className="mt-1 h-1.5" />
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md bg-muted/50 p-3 text-[11px] text-muted-foreground">
              Model: <span className="font-mono text-foreground">facebook/bart-large-mnli</span> · Zero-shot
            </div>
          </Section>

          {/* Priority Reason */}
          <Section title="Priority Explanation" icon={AlertTriangle}>
            <p className="text-sm leading-relaxed text-muted-foreground">{c.priorityReason}</p>
          </Section>

          {/* RAG chunks */}
          <Section title="Policy Used for Recommendation" icon={BookOpen} className="lg:col-span-3">
            <div className="space-y-3">
              {c.ragChunks.map((r, i) => (
                <div key={i} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5 text-primary" /><span className="font-mono text-xs font-semibold">{r.source}</span></div>
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{Math.round(r.score * 100)}% match</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.chunk}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}
