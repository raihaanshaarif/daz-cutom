"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { Sidebar } from "@/components/ui/sidebar";

const AppSidebarDynamic = dynamic(
  () => import("@/components/shared/AppSidebar").then((m) => m.AppSidebar),
  { ssr: false },
);

export function AppSidebarClient(props: ComponentProps<typeof Sidebar>) {
  return <AppSidebarDynamic {...props} />;
}
