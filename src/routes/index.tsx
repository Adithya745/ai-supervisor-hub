import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, Shield, Zap, BarChart3, MessageSquare, ArrowRight, CheckCircle2, Activity, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel AI — Call Center Supervisor Intelligence" },
      { name: "description", content: "Real-time sentiment, intent classification, and policy-aware decision support for call center supervisors." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg gradient-primary text-primary-foreground">
              <Brain className="h-4.5 w-4.5" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight">Sentinel AI</span>
            <span className="ml-2 hidden rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline">Enterprise</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition">Platform</a>
            <a href="#architecture" className="hover:text-foreground transition">Architecture</a>
            <a href="#analytics" className="hover:text-foreground transition">Analytics</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/dashboard"><Button size="sm" className="gradient-primary text-primary-foreground">Launch Console <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--primary-glow)_0%,transparent_55%)] opacity-15" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" /></span>
              Live · Processing 1,247 calls today
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              AI-Powered <span className="text-gradient">Call Center</span><br />Intelligence
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Real-time customer sentiment monitoring, intelligent escalation recommendations, and policy-aware decision support — purpose-built for enterprise supervisors.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/dashboard"><Button size="lg" className="gradient-primary text-primary-foreground shadow-lg shadow-primary/20">Open Supervisor Console <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/knowledge"><Button size="lg" variant="outline">Explore RAG Engine</Button></Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { v: "98.4%", l: "Intent accuracy" },
                { v: "<400ms", l: "Decision latency" },
                { v: "12+", l: "Policy documents" },
                { v: "24/7", l: "Live monitoring" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-card/50 p-4 backdrop-blur">
                  <div className="text-2xl font-bold text-gradient">{s.v}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock dashboard preview */}
          <div className="mx-auto mt-20 max-w-6xl">
            <div className="relative rounded-2xl border border-border bg-card/60 p-2 shadow-2xl shadow-primary/10 backdrop-blur">
              <div className="rounded-xl border border-border bg-background p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-critical" /><div className="h-2 w-2 rounded-full bg-warning" /><div className="h-2 w-2 rounded-full bg-success" /></div>
                  <div className="text-xs text-muted-foreground">supervisor.sentinel.ai/command-center</div>
                  <div />
                </div>
                <div className="grid gap-4 sm:grid-cols-4">
                  {[
                    { l: "Total Calls", v: "1,247", c: "text-foreground" },
                    { l: "Urgent", v: "184", c: "text-critical" },
                    { l: "Avg Sentiment", v: "+0.34", c: "text-success" },
                    { l: "Escalations", v: "18.4%", c: "text-warning" },
                  ].map((k) => (
                    <div key={k.l} className="rounded-lg border border-border bg-card p-4">
                      <div className="text-xs text-muted-foreground">{k.l}</div>
                      <div className={`mt-1 text-2xl font-bold ${k.c}`}>{k.v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-2 rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Queue</div>
                    {["CL-10247 · Refund delay · Negative · URGENT", "CL-10248 · Service outage · Negative · URGENT", "CL-10249 · Plan inquiry · Positive · LOW"].map((row, i) => (
                      <div key={i} className="flex items-center justify-between border-t border-border py-2 text-sm">
                        <span className="text-muted-foreground">{row}</span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${i < 2 ? "bg-critical/15 text-critical" : "bg-success/15 text-success"}`}>{i < 2 ? "ESCALATE" : "SELF-SERVE"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Sparkles className="h-3 w-3" /> AI Copilot</div>
                    <p className="text-sm text-muted-foreground">Per <span className="font-medium text-foreground">ESC-04</span>, this call qualifies for Tier-2 escalation due to repeat negative sentiment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-border/60 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Platform Capabilities</div>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">An operations layer for every supervisor decision</h2>
            <p className="mt-4 text-muted-foreground">Six AI engines working in concert — surfaced through one calm, decision-grade interface.</p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { i: MessageSquare, t: "Sentiment Analysis", d: "DistilBERT-based real-time scoring of every customer utterance, with confidence gauges and trajectory tracking." },
              { i: Brain, t: "Intent Classification", d: "BART zero-shot classifier maps free-form complaints to your taxonomy — no retraining needed." },
              { i: Zap, t: "Priority Engine", d: "Weighted scoring across sentiment, history, churn-language, and SLA risk produces a single Urgent / Medium / Low signal." },
              { i: Database, t: "Multi-Doc RAG", d: "FAISS-indexed retrieval over your SOPs, escalation policies, and playbooks — with source citations and similarity scores." },
              { i: Shield, t: "Policy-Aware Actions", d: "Every recommendation is grounded in the exact policy clause used. Auditable, explainable, defensible." },
              { i: Activity, t: "Supervisor Copilot", d: "Conversational interface that answers \"why is this urgent?\" and \"what should I do?\" with cited reasoning." },
            ].map((f) => (
              <div key={f.t} className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:gradient-primary group-hover:text-primary-foreground">
                  <f.i className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="border-b border-border/60 bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Architecture</div>
            <h2 className="mt-3 text-4xl font-bold tracking-tight">Production-grade ML pipeline</h2>
          </div>
          <div className="mt-16 grid gap-4 lg:grid-cols-4">
            {[
              { t: "Ingest", items: ["Call Transcripts", "CRM Context", "Agent Notes"] },
              { t: "Understand", items: ["DistilBERT Sentiment", "BART Zero-Shot Intent", "Sentence Transformers"] },
              { t: "Retrieve", items: ["FAISS Vector Store", "Policy Embeddings", "Top-K Similarity"] },
              { t: "Act", items: ["Priority Engine", "Next-Best Action", "Supervisor Console"] },
            ].map((c, i) => (
              <div key={c.t} className="relative rounded-2xl border border-border bg-card p-6">
                <div className="mb-2 text-xs font-mono font-semibold text-primary">0{i + 1}</div>
                <h3 className="text-lg font-semibold">{c.t}</h3>
                <ul className="mt-4 space-y-2">
                  {c.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> {it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="analytics" className="py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-6 text-4xl font-bold tracking-tight">Step inside the console</h2>
          <p className="mt-4 text-muted-foreground">Explore the live supervisor dashboard with real-time queues, RAG-grounded recommendations, and analytics.</p>
          <div className="mt-8"><Link to="/dashboard"><Button size="lg" className="gradient-primary text-primary-foreground">Launch Console <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Sentinel AI · Enterprise Edition</div>
          <div>© 2026 · Built for call center supervisors</div>
        </div>
      </footer>
    </div>
  );
}
