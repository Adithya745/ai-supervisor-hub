import { Link, useRouterState } from "@tanstack/react-router";
import { Brain, LayoutDashboard, Headphones, Kanban, BookOpen, BarChart3, Users, Download, Sparkles, Moon, Sun, Search, Bell, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const nav = [
  { group: "Ingest", items: [
    { title: "Upload Transcripts", url: "/upload", icon: Upload },
  ]},
  { group: "Overview", items: [
    { title: "Executive Dashboard", url: "/dashboard", icon: LayoutDashboard },
  ]},
  { group: "Operations", items: [
    { title: "Transcript Explorer", url: "/command-center", icon: Headphones },
    { title: "Priority Monitor", url: "/priority", icon: Kanban },
  ]},
  { group: "Intelligence", items: [
    { title: "Search", url: "/knowledge", icon: BookOpen },
    { title: "AI Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Agent Performance", url: "/agents", icon: Users },
  ]},
  { group: "Workflow", items: [
    { title: "Export Center", url: "/export", icon: Download },
  ]},
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-primary text-primary-foreground">
            <Brain className="h-4.5 w-4.5" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">Sentinel AI</div>
              <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">Supervisor Console</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {nav.map((g) => (
          <SidebarGroup key={g.group}>
            <SidebarGroupLabel>{g.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = path === item.url || path.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url}><item.icon className="h-4 w-4" /><span>{item.title}</span></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="h-8 w-8 shrink-0"><AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">SK</AvatarFallback></Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Sarah Kim</div>
              <div className="truncate text-[10px] text-muted-foreground">Senior Supervisor</div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search calls, agents, policies…" className="h-9 w-72 pl-9 bg-card" />
        </div>
        <Button size="icon" variant="ghost" className="relative h-9 w-9"><Bell className="h-4 w-4" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-critical" /></Button>
        <Button size="icon" variant="ghost" className="h-9 w-9" onClick={toggle}>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
      </div>
    </header>
  );
}

export function AiCopilotFab() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi Sarah. I'm your AI Copilot. Ask me about any call, policy, or recommended action." },
  ]);
  const [input, setInput] = useState("");
  const send = () => {
    if (!input.trim()) return;
    const q = input.trim();
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setTimeout(() => {
      const reply = q.toLowerCase().includes("urgent")
        ? "This call triggers policy **ESC-04**: negative sentiment >0.8 combined with repeat contact within 7 days. Recommended action — escalate to Tier-2 within 10 minutes and offer the standard retention package."
        : q.toLowerCase().includes("policy")
        ? "The most relevant policy is **Complaint_Management.pdf § 2.1** — repeat negative-sentiment complaints require supervisor approval before resolution."
        : "Based on the current queue, 12 calls qualify for Tier-2 escalation. Top driver: billing disputes. I recommend allocating 2 senior agents to the urgent lane.";
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    }, 600);
  };
  return (
    <>
      <button onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full gradient-primary text-primary-foreground shadow-xl shadow-primary/30 transition hover:scale-105">
        <Sparkles className="h-6 w-6" />
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[380px] flex-col rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-md gradient-primary text-primary-foreground"><Sparkles className="h-3.5 w-3.5" /></div>
              <div>
                <div className="text-sm font-semibold">AI Copilot</div>
                <div className="text-[10px] text-success">● Online · Policy-aware</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                  dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") }} />
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {["Why is this urgent?", "What policy applies?", "Show escalation procedure"].map((s) => (
                <button key={s} onClick={() => { setInput(s); }} className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">{s}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask the AI…" className="h-9" />
              <Button size="sm" onClick={send} className="gradient-primary text-primary-foreground">Send</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
