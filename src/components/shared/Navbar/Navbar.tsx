"use client";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const { data: session, status } = useSession();
  return (
    <nav className="fixed top-6 inset-x-4 h-16 max-w-screen-xl mx-auto rounded-full bg-background border dark:border-slate-700/70 z-30">
      <div className="flex h-full items-center justify-between px-6 md:px-8">
        {/* Logo with consistent padding */}
        <Link href="/" className="flex-shrink-0 ">
          <Logo />
        </Link>

        {/* Desktop Menu with consistent horizontal spacing */}
        <NavMenu className="hidden md:block" />

        {/* Actions and Mobile Menu */}
        <div className="flex items-center gap-4 md:gap-6">
          {status === "authenticated" ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {session.user?.name || session.user?.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-full px-3 py-2 text-sm"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <Button className="rounded-full px-5 py-2 text-sm md:text-base">
              <Link href="/login" className="block w-full text-center">
                Login
              </Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
