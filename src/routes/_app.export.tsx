import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app-shell";
import { FileSpreadsheet, FileText, FileDown, FilePieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/export")({
  head: () => ({ meta: [{ title: "Export Center · Sentinel AI" }] }),
  component: ExportPage,
});

const items = [
  { icon: FileSpreadsheet, title: "Export CSV", desc: "Raw call records, sentiment & priority scores", color: "text-success", bg: "bg-success/10", action: "Generating CSV…", done: "CSV downloaded" },
  { icon: FilePieChart, title: "Export Excel", desc: "Multi-sheet workbook with KPIs and charts", color: "text-primary", bg: "bg-primary/10", action: "Building workbook…", done: "Excel ready" },
  { icon: FileText, title: "Generate PDF Report", desc: "Executive summary with AI insights and recommendations", color: "text-warning", bg: "bg-warning/10", action: "Composing PDF…", done: "PDF generated" },
  { icon: FileDown, title: "Supervisor Summary", desc: "End-of-shift briefing with escalations and pending actions", color: "text-critical", bg: "bg-critical/10", action: "Preparing briefing…", done: "Summary ready" },
];

function ExportPage() {
  return (
    <>
      <TopBar title="Export Center" subtitle="Download data, reports, and supervisor briefings" />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.title} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${it.bg} ${it.color}`}><it.icon className="h-6 w-6" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold">{it.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
                  <Button className="mt-4 gradient-primary text-primary-foreground" size="sm" onClick={() => {
                    const t = toast.loading(it.action);
                    setTimeout(() => toast.success(it.done, { id: t }), 1200);
                  }}>{it.title}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold">Recent Exports</h3>
          <div className="mt-4 divide-y divide-border">
            {[
              { name: "Supervisor_Briefing_2026-06-20.pdf", size: "1.2 MB", time: "12 min ago" },
              { name: "Calls_Q2_Sentiment.xlsx", size: "3.4 MB", time: "1 hour ago" },
              { name: "Escalations_Week24.csv", size: "812 KB", time: "Yesterday" },
            ].map((f) => (
              <div key={f.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-muted-foreground"/><span className="text-sm font-medium">{f.name}</span></div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground"><span>{f.size}</span><span>{f.time}</span><Button size="sm" variant="ghost" className="h-7">Download</Button></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
