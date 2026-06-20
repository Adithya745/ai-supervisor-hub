import { create } from "zustand";
import { persist } from "zustand/middleware";
import { processTranscript, type ProcessedTranscript } from "./pipeline";

interface State {
  transcripts: ProcessedTranscript[];
  ingestFiles: (files: File[], onProgress?: (done: number, total: number) => void) => Promise<{ added: number; failed: number }>;
  remove: (id: string) => void;
  clearAll: () => void;
}

export const useTranscripts = create<State>()(
  persist(
    (set, get) => ({
      transcripts: [],
      ingestFiles: async (files, onProgress) => {
        let added = 0, failed = 0;
        const batch: ProcessedTranscript[] = [];
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          try {
            if (!/\.(txt|md|log)$/i.test(f.name) && !f.type.startsWith("text/")) { failed++; onProgress?.(i + 1, files.length); continue; }
            const text = await f.text();
            if (!text.trim()) { failed++; onProgress?.(i + 1, files.length); continue; }
            batch.push(processTranscript(f.name, text));
            added++;
          } catch { failed++; }
          onProgress?.(i + 1, files.length);
          if (i % 10 === 9) await new Promise((r) => setTimeout(r, 0));
        }
        set({ transcripts: [...batch, ...get().transcripts] });
        return { added, failed };
      },
      remove: (id) => set({ transcripts: get().transcripts.filter((t) => t.id !== id) }),
      clearAll: () => set({ transcripts: [] }),
    }),
    { name: "sentinel-transcripts-v1" },
  ),
);

// ----- Derived selectors -----
export function useMetrics() {
  const transcripts = useTranscripts((s) => s.transcripts);
  const total = transcripts.length;
  const urgent = transcripts.filter((t) => t.priority === "URGENT").length;
  const medium = transcripts.filter((t) => t.priority === "MEDIUM").length;
  const low = transcripts.filter((t) => t.priority === "LOW").length;
  const positive = transcripts.filter((t) => t.sentiment === "Positive").length;
  const negative = transcripts.filter((t) => t.sentiment === "Negative").length;
  const neutral = transcripts.filter((t) => t.sentiment === "Neutral").length;
  const avgPriority = total ? Math.round(transcripts.reduce((a, t) => a + t.priorityScore, 0) / total) : 0;
  const escalationRate = total ? Math.round((urgent / total) * 1000) / 10 : 0;
  return { total, urgent, medium, low, positive, negative, neutral, avgPriority, escalationRate };
}

export function usePriorityDist() {
  const m = useMetrics();
  return [
    { name: "Urgent", value: m.urgent, color: "var(--critical)" },
    { name: "Medium", value: m.medium, color: "var(--warning)" },
    { name: "Low", value: m.low, color: "var(--success)" },
  ];
}

export function useCategoryDist() {
  const transcripts = useTranscripts((s) => s.transcripts);
  const map = new Map<string, number>();
  for (const t of transcripts) map.set(t.category, (map.get(t.category) ?? 0) + 1);
  return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function useSentimentTrend() {
  // Group by upload bucket (10 buckets across all uploads)
  const transcripts = [...useTranscripts((s) => s.transcripts)].sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
  if (transcripts.length === 0) return [];
  const buckets = Math.min(10, transcripts.length);
  const size = Math.ceil(transcripts.length / buckets);
  const out: { day: string; positive: number; neutral: number; negative: number }[] = [];
  for (let i = 0; i < buckets; i++) {
    const slice = transcripts.slice(i * size, (i + 1) * size);
    out.push({
      day: `B${i + 1}`,
      positive: slice.filter((t) => t.sentiment === "Positive").length,
      neutral: slice.filter((t) => t.sentiment === "Neutral").length,
      negative: slice.filter((t) => t.sentiment === "Negative").length,
    });
  }
  return out;
}
