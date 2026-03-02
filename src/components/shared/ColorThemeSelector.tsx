"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STORAGE_KEY = "color-theme";

const themes = [
  {
    id: "default",
    label: "Default",
    swatch: "bg-zinc-900",
  },
  {
    id: "slack",
    label: "Slack",
    swatch: "bg-[oklch(0.37_0.14_323.40)]",
  },
];

export function ColorThemeSelector() {
  const [active, setActive] = useState("default");

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) ?? "default";
    applyTheme(saved);
    setActive(saved);
  }, []);

  function applyTheme(id: string) {
    const html = document.documentElement;
    if (id === "default") {
      html.removeAttribute("data-color-theme");
    } else {
      html.setAttribute("data-color-theme", id);
    }
    localStorage.setItem(STORAGE_KEY, id);
  }

  function handleSelect(id: string) {
    applyTheme(id);
    setActive(id);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <Palette className="size-4" />
          <span className="sr-only">Color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => handleSelect(t.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className={`size-3 rounded-full border ${t.swatch}`} />
            {t.label}
            {active === t.id && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
