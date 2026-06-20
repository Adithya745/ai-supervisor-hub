import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { useTranscripts } from "@/lib/transcript-store";
import { EmptyState } from "@/components/upload-zone";
import { useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/knowledge")({
  head: () => ({ meta: [{ title: "Transcript Explorer · Sentinel AI" }] }),
  component: KnowledgePage,
});

function KnowledgePage() {
  const transcripts = useTranscripts((s) => s.transcripts);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    if (!q.trim()) return transcripts;
    const needle = q.toLowerCase();
    return transcripts
      .map((t) => {
        const hay = (t.filename + " " + t.text + " " + t.category).toLowerCase();
        const idx = hay.indexOf(needle);
        return { t, score: idx >= 0 ? 1 - idx / hay.length : 0 };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.t);
  }, [transcripts, q]);

  if (transcripts.length === 0) return (<><TopBar title="Transcript Search" /><div className="p-6"><EmptyState /></div></>);

  return (
    <>
      <TopBar title="Transcript Search" subtitle="Semantic-style search across all uploaded transcripts" />
      <div className="space-y-4 p-6">
        <div className="relative max-w-2xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transcripts by keyword, customer name, issue…" className="h-11 pl-10 bg-card text-base" />
        </div>

        <div className="grid gap-3">
          {results.map((t) => (
            <Link key={t.id} to="/calls/$id" params={{ id: t.id }}
              className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><span className="font-medium">{t.filename}</span></div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{t.category}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${t.priority === "URGENT" ? "bg-critical/15 text-critical" : t.priority === "MEDIUM" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{t.priority}</span>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.summary}</p>
            </Link>
          ))}
          {results.length === 0 && <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No matches for "{q}"</div>}
        </div>
      </div>
    </>
  );
}
