import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar, AiCopilotFab } from "@/components/app-shell";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1 border-b border-border bg-background/60 px-2 py-1 backdrop-blur md:hidden">
            <SidebarTrigger />
            <span className="text-sm font-semibold">Sentinel AI</span>
          </div>
          <div className="flex-1">
            <Outlet />
          </div>
        </SidebarInset>
        <AiCopilotFab />
      </div>
    </SidebarProvider>
  );
}
