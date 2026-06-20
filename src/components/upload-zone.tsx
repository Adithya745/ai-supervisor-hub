import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranscripts } from "@/lib/transcript-store";
import { toast } from "sonner";

export function UploadZone({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const ingest = useTranscripts((s) => s.ingestFiles);
  const count = useTranscripts((s) => s.transcripts.length);
  const clearAll = useTranscripts((s) => s.clearAll);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setProgress({ done: 0, total: files.length });
    const res = await ingest(files, (done, total) => setProgress({ done, total }));
    setProgress(null);
    if (res.added) toast.success(`Processed ${res.added} transcript${res.added > 1 ? "s" : ""}${res.failed ? ` · ${res.failed} skipped` : ""}`);
    else toast.error("No valid transcripts found. Upload .txt files.");
  }, [ingest]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const files: File[] = [];
    if (e.dataTransfer.items) {
      for (const it of Array.from(e.dataTransfer.items)) {
        const f = it.getAsFile(); if (f) files.push(f);
      }
    } else for (const f of Array.from(e.dataTransfer.files)) files.push(f);
    handleFiles(files);
  }, [handleFiles]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`relative rounded-xl border-2 border-dashed transition ${dragging ? "border-primary bg-primary/5" : "border-border bg-card"} ${compact ? "p-4" : "p-8"}`}
    >
      <input
        ref={inputRef} type="file" accept=".txt,.md,.log,text/plain" multiple className="hidden"
        onChange={(e) => { handleFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }}
      />
      <div className={`flex flex-col items-center justify-center text-center ${compact ? "gap-2" : "gap-4"}`}>
        <div className={`grid place-items-center rounded-full bg-primary/10 text-primary ${compact ? "h-10 w-10" : "h-14 w-14"}`}>
          {progress ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className={compact ? "h-5 w-5" : "h-7 w-7"} />}
        </div>
        {progress ? (
          <div className="w-full max-w-sm">
            <div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">Processing transcripts…</span><span className="font-mono font-semibold">{progress.done}/{progress.total}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} /></div>
          </div>
        ) : (
          <>
            <div>
              <p className={`font-semibold ${compact ? "text-sm" : "text-base"}`}>Drop transcript files here</p>
              <p className="text-xs text-muted-foreground">Supports bulk upload · .txt · 100+ files at once</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size={compact ? "sm" : "default"} onClick={() => inputRef.current?.click()} className="gradient-primary text-primary-foreground">
                <FileText className="mr-1.5 h-4 w-4" /> Browse files
              </Button>
              {count > 0 && (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {count} loaded
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => { clearAll(); toast("Cleared all transcripts"); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title = "No transcripts uploaded yet", hint = "Upload customer-agent transcripts to see live AI analysis here." }: { title?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-12 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-warning/10 text-warning"><AlertTriangle className="h-6 w-6" /></div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{hint}</p>
      <a href="/upload" className="mt-4 inline-flex h-9 items-center rounded-md gradient-primary px-4 text-sm font-medium text-primary-foreground">Go to Upload Center</a>
    </div>
  );
}
