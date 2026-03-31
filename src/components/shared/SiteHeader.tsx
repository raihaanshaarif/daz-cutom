"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Maximize2, Minimize2 } from "lucide-react";
import { ColorThemeSelector } from "@/components/shared/ColorThemeSelector";
import { Button } from "@/components/ui/button";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  contact: "Contacts",
  "create-contact": "Create Contact",
  "my-contacts": "My Contacts",
  user: "Users",
  "create-user": "Create User",
  "user-list": "User List",
  "user-profile": "Profile",
  country: "Country",
  "create-country": "Create Country",
  "country-list": "Country List",
  "my-task": "My Tasks",
  admin: "Admin",
  task: "Tasks",
  "create-task": "Create Task",
  "all-task": "All Tasks",
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Load and apply initial state only after mount
  React.useEffect(() => {
    const savedState = localStorage.getItem("isFullscreen") === "true";
    // Important: We only set the state, we don't trigger the actual fullscreen
    // here because browsers require a user gesture to enter fullscreen.
    // However, if the user was already in fullscreen (e.g. reload),
    // the document.fullscreenElement check is more reliable.
    setIsFullscreen(!!document.fullscreenElement);

    const handleFullscreenChange = () => {
      const current = !!document.fullscreenElement;
      setIsFullscreen(current);
      localStorage.setItem("isFullscreen", String(current));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Build breadcrumb segments from path
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label =
      ROUTE_LABELS[seg] ??
      seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });

  return (
    <header className="bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {crumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem
                className={idx < crumbs.length - 1 ? "hidden md:block" : ""}
              >
                {idx < crumbs.length - 1 ? (
                  <BreadcrumbLink href={crumb.href}>
                    {crumb.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {idx < crumbs.length - 1 && (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground transition-colors hover:text-foreground"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="size-4" />
        ) : (
          <Maximize2 className="size-4" />
        )}
      </Button>

      <ColorThemeSelector />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="ml-auto flex items-center justify-center rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs font-semibold">
                {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="font-semibold">{session?.user?.name}</p>
            <p className="text-xs font-normal text-muted-foreground">
              {session?.user?.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              if (session?.user?.id) {
                router.push(
                  `/dashboard/user/user-profile?id=${session.user.id}`,
                );
              }
            }}
            className="cursor-pointer"
          >
            <User className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
