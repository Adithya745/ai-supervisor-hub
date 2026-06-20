// Client-side NLP-style processing pipeline for customer-agent transcripts.
// Rule-based & deterministic so it runs in the browser with zero backend.

export type Sentiment = "Positive" | "Neutral" | "Negative";
export type Priority = "URGENT" | "MEDIUM" | "LOW";
export type Category =
  | "Billing Issue"
  | "Technical Issue"
  | "Account Problem"
  | "Refund Request"
  | "Service Outage"
  | "Product Inquiry"
  | "Cancellation Request"
  | "Positive Feedback"
  | "Complaint";

export interface ProcessedTranscript {
  id: string;
  filename: string;
  text: string;
  uploadedAt: string;
  sentiment: Sentiment;
  sentimentConfidence: number;
  category: Category;
  categoryConfidence: number;
  priority: Priority;
  priorityScore: number;
  priorityReasons: string[];
  recommendation: string;
  summary: string;
  agent: string;
  customer: string;
  durationEstimate: string;
}

// ---------- Sentiment ----------
const POS = ["thank you", "thanks", "appreciate", "great", "awesome", "happy", "love", "excellent", "amazing", "wonderful", "helpful", "fantastic", "perfect", "satisfied", "resolved", "kind", "pleased"];
const NEG = ["angry", "frustrated", "terrible", "horrible", "worst", "disappointed", "unacceptable", "ridiculous", "useless", "broken", "fail", "failed", "issue", "problem", "complaint", "wrong", "never", "not working", "doesn't work", "still not", "hate", "annoyed", "upset", "outage", "down", "stuck", "lost"];

function countMatches(text: string, words: string[]) {
  let n = 0;
  for (const w of words) {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const m = text.match(re);
    if (m) n += m.length;
  }
  return n;
}

function analyzeSentiment(text: string): { sentiment: Sentiment; confidence: number } {
  const pos = countMatches(text, POS);
  const neg = countMatches(text, NEG);
  const total = pos + neg;
  if (total === 0) return { sentiment: "Neutral", confidence: 0.6 };
  const ratio = (pos - neg) / total;
  if (ratio > 0.25) return { sentiment: "Positive", confidence: Math.min(0.99, 0.7 + ratio * 0.3) };
  if (ratio < -0.15) return { sentiment: "Negative", confidence: Math.min(0.99, 0.7 + Math.abs(ratio) * 0.3) };
  return { sentiment: "Neutral", confidence: 0.65 };
}

// ---------- Category ----------
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  "Billing Issue": ["bill", "billing", "charge", "charged", "invoice", "payment", "overcharge", "double charge", "fee", "subscription"],
  "Technical Issue": ["error", "bug", "crash", "crashing", "not working", "broken", "slow", "connection", "login fail", "app", "loading", "freeze"],
  "Account Problem": ["account", "locked", "password", "login", "sign in", "2fa", "username", "access", "profile", "verification"],
  "Refund Request": ["refund", "money back", "reimburse", "return", "chargeback"],
  "Service Outage": ["outage", "down", "offline", "service is down", "everything is down", "no service", "disconnect"],
  "Product Inquiry": ["how do i", "how can i", "question about", "wondering", "feature", "plan", "pricing", "interested in"],
  "Cancellation Request": ["cancel", "cancellation", "terminate", "close my account", "unsubscribe", "switch provider", "leaving"],
  "Positive Feedback": ["thank you so much", "great job", "amazing service", "compliment", "well done", "love your"],
  "Complaint": ["complaint", "complain", "unacceptable", "manager", "speak to supervisor", "file a complaint"],
};

function classifyCategory(text: string): { category: Category; confidence: number } {
  const scores = (Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]).map(([cat, kws]) => [cat, countMatches(text, kws)] as const);
  scores.sort((a, b) => b[1] - a[1]);
  const [topCat, topScore] = scores[0];
  const secondScore = scores[1]?.[1] ?? 0;
  if (topScore === 0) return { category: "Product Inquiry", confidence: 0.45 };
  const margin = (topScore - secondScore) / topScore;
  const confidence = Math.min(0.98, 0.6 + margin * 0.35 + Math.min(topScore, 5) * 0.02);
  return { category: topCat, confidence };
}

// ---------- Priority ----------
const URGENT_TRIGGERS: { re: RegExp; reason: string }[] = [
  { re: /\b(third time|fourth time|again|multiple times|several times|keep calling)\b/i, reason: "Multiple failed support attempts" },
  { re: /\b(cancel|terminate|switch provider|close (my )?account|leaving)\b/i, reason: "Customer threatening cancellation" },
  { re: /\b(outage|service is down|everything is down|no service|offline)\b/i, reason: "Service outage detected" },
  { re: /\b(escalate|supervisor|manager|file a complaint)\b/i, reason: "Escalation request" },
  { re: /\b(refund|money back).{0,40}(still|haven'?t|never|waiting|weeks|days)\b/i, reason: "Refund delay" },
  { re: /\b(account (is )?locked|can'?t (log|sign) in|locked out)\b/i, reason: "Account locked" },
  { re: /\b(unacceptable|disgusted|outraged|lawsuit|sue|attorney)\b/i, reason: "Severe complaint" },
];
const MEDIUM_TRIGGERS: { re: RegExp; reason: string }[] = [
  { re: /\b(still (not )?(working|fixed)|unresolved|hasn'?t been fixed)\b/i, reason: "Issue unresolved" },
  { re: /\b(frustrated|annoyed|upset|disappointed)\b/i, reason: "Moderate frustration" },
  { re: /\b(follow up|callback|call me back)\b/i, reason: "Follow-up needed" },
];

function detectPriority(text: string): { priority: Priority; score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  for (const t of URGENT_TRIGGERS) if (t.re.test(text)) { reasons.push(t.reason); score += 25; }
  for (const t of MEDIUM_TRIGGERS) if (t.re.test(text)) { reasons.push(t.reason); score += 10; }
  if (score >= 25) return { priority: "URGENT", score: Math.min(99, 70 + score), reasons };
  if (score >= 10) return { priority: "MEDIUM", score: 40 + score, reasons };
  return { priority: "LOW", score: 10 + Math.min(score, 20), reasons: reasons.length ? reasons : ["Routine inquiry — no escalation triggers detected"] };
}

// ---------- Recommendation ----------
function recommend(priority: Priority, category: Category): string {
  if (priority === "URGENT") {
    if (category === "Cancellation Request") return "Escalate to retention specialist immediately and contact customer within 15 minutes";
    if (category === "Service Outage") return "Escalate to NOC and supervisor; broadcast status update within 15 minutes";
    if (category === "Refund Request") return "Escalate to billing supervisor; authorize refund per SOP-04 within 15 minutes";
    if (category === "Account Problem") return "Escalate to Tier-2 security; unlock and verify identity within 15 minutes";
    return "Escalate immediately to supervisor and contact customer within 15 minutes";
  }
  if (priority === "MEDIUM") return "Assign to specialist queue and follow up within 24 hours";
  if (category === "Positive Feedback") return "Log feedback in CSAT dashboard and thank the customer";
  return "Route to self-service knowledge base and close after confirmation";
}

// ---------- Helpers ----------
function extractParticipants(text: string): { agent: string; customer: string } {
  const agentMatch = text.match(/(?:agent|representative|rep)\s*[:\-]\s*(?:my name is|this is)?\s*([A-Z][a-zA-Z]+)/i);
  const customerMatch = text.match(/(?:customer|caller)\s*[:\-]\s*(?:hi|hello)?[, ]*(?:my name is|this is)?\s*([A-Z][a-zA-Z]+)/i);
  const nameMatch = text.match(/\b(?:my name is|this is)\s+([A-Z][a-zA-Z]+)/);
  return {
    agent: agentMatch?.[1] ?? "Agent",
    customer: customerMatch?.[1] ?? nameMatch?.[1] ?? "Customer",
  };
}

function summarize(text: string, category: Category): string {
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
  const cust = sentences.find((s) => /\b(i|my|we)\b/i.test(s) && /(issue|problem|not|won'?t|can'?t|refund|cancel|charge|outage|error)/i.test(s));
  return cust?.slice(0, 220) ?? sentences[0]?.slice(0, 220) ?? `Customer transcript categorized as ${category}.`;
}

let counter = 0;
export function processTranscript(filename: string, text: string): ProcessedTranscript {
  const cleanText = text.trim();
  const { sentiment, confidence: sc } = analyzeSentiment(cleanText);
  const { category, confidence: cc } = classifyCategory(cleanText);
  const { priority, score, reasons } = detectPriority(cleanText);
  const { agent, customer } = extractParticipants(cleanText);
  const wordCount = cleanText.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(wordCount / 130));
  const id = `TR-${Date.now().toString(36)}-${(counter++).toString(36)}`;
  return {
    id,
    filename,
    text: cleanText,
    uploadedAt: new Date().toISOString(),
    sentiment,
    sentimentConfidence: sc,
    category,
    categoryConfidence: cc,
    priority,
    priorityScore: score,
    priorityReasons: reasons,
    recommendation: recommend(priority, category),
    summary: summarize(cleanText, category),
    agent,
    customer,
    durationEstimate: `${minutes}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
  };
}
