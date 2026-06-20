import { createFileRoute, Link } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { UploadZone } from "@/components/upload-zone";
import { useTranscripts } from "@/lib/transcript-store";
import { FileText, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/upload")({
  head: () => ({ meta: [{ title: "Upload Transcripts · Sentinel AI" }] }),
  component: UploadPage,
});

function UploadPage() {
  const transcripts = useTranscripts((s) => s.transcripts);
  const remove = useTranscripts((s) => s.remove);
  const sample = `Agent: Thank you for calling Acme Support, my name is Jordan. How can I help?
Customer: Hi Jordan, this is the third time I'm calling about my refund. It's been three weeks and I still haven't received my money back. This is unacceptable.
Agent: I'm really sorry to hear that. Let me pull up your account.
Customer: If this isn't resolved today I'm going to cancel my subscription and switch providers.
Agent: I completely understand. I'm escalating this to my supervisor right now.`;

  const downloadSample = () => {
    const blob = new Blob([sample], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sample-transcript.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <TopBar title="Transcript Upload Center" subtitle="Drop call transcripts to run sentiment, category, priority & escalation analysis" />
      <div className="space-y-6 p-6">
        <UploadZone />

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={downloadSample}>Download sample transcript</Button>
          {transcripts.length > 0 && (
            <Button asChild size="sm" className="gradient-primary text-primary-foreground">
              <Link to="/dashboard">View Executive Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          )}
        </div>

        {transcripts.length > 0 && (
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Processed transcripts <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs">{transcripts.length}</span></h3>
            </div>
            <div className="max-h-[480px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr><th className="px-4 py-2 text-left">File</th><th className="px-4 py-2 text-left">Category</th><th className="px-4 py-2 text-left">Sentiment</th><th className="px-4 py-2 text-left">Priority</th><th className="px-4 py-2"></th></tr>
                </thead>
                <tbody>
                  {transcripts.map((t) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="px-4 py-2"><Link to="/calls/$id" params={{ id: t.id }} className="inline-flex items-center gap-1.5 text-primary hover:underline"><FileText className="h-3.5 w-3.5" />{t.filename}</Link></td>
                      <td className="px-4 py-2 text-muted-foreground">{t.category}</td>
                      <td className="px-4 py-2"><span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${t.sentiment === "Negative" ? "bg-critical/15 text-critical" : t.sentiment === "Positive" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{t.sentiment}</span></td>
                      <td className="px-4 py-2"><span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${t.priority === "URGENT" ? "bg-critical/15 text-critical" : t.priority === "MEDIUM" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{t.priority}</span></td>
                      <td className="px-4 py-2 text-right"><button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-critical"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
