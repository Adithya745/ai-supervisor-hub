export type Priority = "urgent" | "medium" | "low";
export type Sentiment = "positive" | "neutral" | "negative";
export type EscalationStatus = "pending" | "escalated" | "resolved" | "in_progress";

export interface Call {
  id: string;
  customer: string;
  issue: string;
  category: string;
  sentiment: Sentiment;
  sentimentScore: number;
  priority: Priority;
  priorityScore: number;
  agent: string;
  escalation: EscalationStatus;
  recommendedAction: string;
  duration: string;
  createdAt: string;
  transcript: { speaker: "customer" | "agent"; text: string; time: string }[];
  summary: string;
  intents: { label: string; score: number }[];
  priorityReason: string;
  ragChunks: { source: string; chunk: string; score: number }[];
}

const issues = [
  { issue: "Refund not processed after 14 days", category: "Billing", priority: "urgent" as Priority, sentiment: "negative" as Sentiment },
  { issue: "Internet keeps disconnecting every hour", category: "Technical", priority: "urgent" as Priority, sentiment: "negative" as Sentiment },
  { issue: "Wrong item delivered, need replacement", category: "Logistics", priority: "medium" as Priority, sentiment: "negative" as Sentiment },
  { issue: "Inquiry about premium plan features", category: "Sales", priority: "low" as Priority, sentiment: "positive" as Sentiment },
  { issue: "Account locked, cannot login", category: "Account", priority: "urgent" as Priority, sentiment: "negative" as Sentiment },
  { issue: "Subscription renewal question", category: "Billing", priority: "low" as Priority, sentiment: "neutral" as Sentiment },
  { issue: "App crashing on launch", category: "Technical", priority: "medium" as Priority, sentiment: "negative" as Sentiment },
  { issue: "Compliment for great support", category: "Feedback", priority: "low" as Priority, sentiment: "positive" as Sentiment },
  { issue: "Threatening to cancel — service outage", category: "Retention", priority: "urgent" as Priority, sentiment: "negative" as Sentiment },
  { issue: "Update billing address", category: "Account", priority: "low" as Priority, sentiment: "neutral" as Sentiment },
  { issue: "Double charged on last invoice", category: "Billing", priority: "urgent" as Priority, sentiment: "negative" as Sentiment },
  { issue: "How to enable 2FA", category: "Account", priority: "low" as Priority, sentiment: "neutral" as Sentiment },
  { issue: "Service downgrade request", category: "Retention", priority: "medium" as Priority, sentiment: "negative" as Sentiment },
  { issue: "Integration with Salesforce not syncing", category: "Technical", priority: "medium" as Priority, sentiment: "neutral" as Sentiment },
  { issue: "Enterprise quote request", category: "Sales", priority: "medium" as Priority, sentiment: "positive" as Sentiment },
];

const customers = ["Sarah Johnson", "Michael Chen", "Priya Patel", "James Wilson", "Emily Rodriguez", "David Kim", "Aisha Khan", "Robert Taylor", "Linda Martinez", "Daniel Brown", "Sophia Garcia", "Ethan Davis", "Olivia Smith", "Noah Anderson", "Mia Thompson"];
const agents = ["Alex Morgan", "Jordan Lee", "Casey Nguyen", "Taylor Brooks", "Riley Park", "Morgan Cole"];

const actions: Record<Priority, string[]> = {
  urgent: ["Escalate to Tier-2 supervisor immediately", "Initiate retention offer & callback in 15 min", "Issue refund and apologize per SOP-04"],
  medium: ["Schedule callback within 4 hours", "Assign to specialist queue", "Send troubleshooting guide & follow up"],
  low: ["Send standard knowledge article", "Log and close after confirmation", "Route to self-service portal"],
};

const ragPool = [
  { source: "Escalation_Process.pdf", chunk: "Any call involving billing disputes over $100 must be escalated to Tier-2 within 10 minutes of identification per policy ESC-04.", score: 0.92 },
  { source: "Complaint_Management.pdf", chunk: "Negative-sentiment complaints regarding repeat issues (≥2 prior contacts) require supervisor approval before resolution to ensure customer retention.", score: 0.88 },
  { source: "Customer_Service_Playbook.pdf", chunk: "Refund authorization up to $500 is delegated to senior agents. Anything above requires written supervisor approval and an apology script.", score: 0.84 },
  { source: "Retention_SOP.pdf", chunk: "Customers expressing intent to cancel must be offered the standard retention package (20% discount, 3 months) before transfer.", score: 0.81 },
  { source: "Technical_Triage.pdf", chunk: "Service outages affecting >5 customers in the same region must be reported to NOC and a status ticket opened automatically.", score: 0.77 },
];

function genTranscript(issue: string) {
  return [
    { speaker: "agent" as const, text: "Thank you for calling Acme Support. My name is Jordan. How can I help today?", time: "00:00" },
    { speaker: "customer" as const, text: `Hi, I'm calling about ${issue.toLowerCase()}. This has been going on for a while and I'm really frustrated.`, time: "00:08" },
    { speaker: "agent" as const, text: "I'm really sorry to hear that. Let me pull up your account and look into this right away.", time: "00:22" },
    { speaker: "customer" as const, text: "I've already contacted you twice about this. I expect a real resolution this time.", time: "00:34" },
    { speaker: "agent" as const, text: "I completely understand. I can see the history here. Let me check what options we have to make this right.", time: "00:48" },
    { speaker: "customer" as const, text: "If this isn't fixed today, I'll have to consider switching providers.", time: "01:05" },
  ];
}

export const calls: Call[] = issues.map((it, i) => {
  const id = `CL-${(10247 + i).toString()}`;
  return {
    id,
    customer: customers[i % customers.length],
    issue: it.issue,
    category: it.category,
    sentiment: it.sentiment,
    sentimentScore: it.sentiment === "negative" ? 0.82 + Math.random() * 0.15 : it.sentiment === "positive" ? 0.78 + Math.random() * 0.18 : 0.55 + Math.random() * 0.2,
    priority: it.priority,
    priorityScore: it.priority === "urgent" ? 85 + Math.floor(Math.random() * 14) : it.priority === "medium" ? 55 + Math.floor(Math.random() * 25) : 15 + Math.floor(Math.random() * 30),
    agent: agents[i % agents.length],
    escalation: it.priority === "urgent" ? (i % 2 === 0 ? "escalated" : "pending") : i % 3 === 0 ? "in_progress" : "resolved",
    recommendedAction: actions[it.priority][i % 3],
    duration: `${3 + (i % 9)}:${(10 + i * 7) % 60}`.padEnd(4, "0"),
    createdAt: new Date(Date.now() - i * 1000 * 60 * 7).toISOString(),
    transcript: genTranscript(it.issue),
    summary: `Customer reports ${it.issue.toLowerCase()}. Prior contact history indicates repeat escalation. Sentiment trends negative throughout the call, with explicit churn risk language detected near minute 1.`,
    intents: [
      { label: it.category, score: 0.81 + Math.random() * 0.15 },
      { label: it.priority === "urgent" ? "Complaint" : "Inquiry", score: 0.55 + Math.random() * 0.2 },
      { label: "Refund Request", score: 0.32 + Math.random() * 0.15 },
    ],
    priorityReason: it.priority === "urgent"
      ? "Negative sentiment (>0.8), repeat contact within 7 days, and explicit churn-intent language matched policy ESC-04 and Retention_SOP § 2.1."
      : it.priority === "medium"
      ? "Mixed sentiment with unresolved technical issue. Policy CMP-02 recommends scheduled follow-up within SLA."
      : "Neutral inquiry resolvable via self-service knowledge base. No escalation triggers detected.",
    ragChunks: ragPool.slice(0, 3 + (i % 3)).map((r) => ({ ...r, score: Math.min(0.97, r.score + Math.random() * 0.05) })),
  };
});

export const kpis = {
  totalCalls: 1247,
  urgent: calls.filter((c) => c.priority === "urgent").length * 12,
  medium: calls.filter((c) => c.priority === "medium").length * 15,
  low: calls.filter((c) => c.priority === "low").length * 18,
  positiveSentiment: 642,
  negativeSentiment: 318,
  avgPriorityScore: 64,
  escalationRate: 18.4,
};

export const sentimentTrend = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  positive: 40 + Math.round(Math.random() * 25),
  neutral: 25 + Math.round(Math.random() * 15),
  negative: 15 + Math.round(Math.random() * 20),
}));

export const categoryDist = [
  { name: "Billing", value: 312 },
  { name: "Technical", value: 268 },
  { name: "Account", value: 184 },
  { name: "Sales", value: 142 },
  { name: "Logistics", value: 121 },
  { name: "Retention", value: 98 },
  { name: "Feedback", value: 62 },
];

export const priorityDist = [
  { name: "Urgent", value: 184, color: "var(--critical)" },
  { name: "Medium", value: 412, color: "var(--warning)" },
  { name: "Low", value: 651, color: "var(--success)" },
];

export const callVolume = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i * 2}:00`,
  calls: 30 + Math.round(Math.random() * 90),
}));

export const escalationTrend = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
  rate: 12 + Math.round(Math.random() * 18),
}));

export const agents_data = [
  { name: "Alex Morgan", calls: 142, sentiment: 0.78, escalations: 9, quality: 94 },
  { name: "Jordan Lee", calls: 138, sentiment: 0.81, escalations: 6, quality: 96 },
  { name: "Casey Nguyen", calls: 121, sentiment: 0.69, escalations: 14, quality: 87 },
  { name: "Taylor Brooks", calls: 156, sentiment: 0.74, escalations: 11, quality: 91 },
  { name: "Riley Park", calls: 109, sentiment: 0.83, escalations: 5, quality: 97 },
  { name: "Morgan Cole", calls: 134, sentiment: 0.71, escalations: 12, quality: 89 },
];

export const topComplaints = [
  { name: "Billing Disputes", value: 87 },
  { name: "Service Outage", value: 64 },
  { name: "Refund Delay", value: 52 },
  { name: "Wrong Delivery", value: 41 },
  { name: "Login Issues", value: 36 },
];
