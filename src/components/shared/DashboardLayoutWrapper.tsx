"use client";

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebarClient } from "./AppSidebarClient";
import { SiteHeader } from "./SiteHeader";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

export function DashboardLayoutWrapper({
  children,
}: DashboardLayoutWrapperProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    setMounted(true);

    // On desktop: always open, ignore cookie
    // On mobile: read from cookie, default to closed
    if (!isMobile) {
      setDefaultOpen(true);
    } else {
      // On mobile, check cookie preference
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("sidebar_state="))
        ?.split("=")[1];
      setDefaultOpen(cookieValue === "true");
    }
  }, [isMobile]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    // Return a basic structure that matches server-rendered layout
    return (
      <SidebarProvider defaultOpen={true}>
        <AppSidebarClient variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebarClient variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
