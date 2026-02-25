"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Home,
  PlusCircle,
  LogOut,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function Sidebar() {
  const session = useSession();
  const [isUserExpanded, setIsUserExpanded] = useState(false);
  const [isBuyerExpanded, setIsBuyerExpanded] = useState(false);

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-black text-white">
      {/* Top navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>

        {/* Buyer Section */}
        <div>
          <button
            onClick={() => setIsBuyerExpanded(!isBuyerExpanded)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black w-full text-left"
          >
            <Users className="h-4 w-4" />
            Buyer
            {isBuyerExpanded ? (
              <ChevronDown className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-auto" />
            )}
          </button>
          {isBuyerExpanded && (
            <div className="ml-6 space-y-1">
              <Link
                href="/dashboard/create-contact"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
              >
                <PlusCircle className="h-4 w-4" />
                Create Contact
              </Link>

              <Link
                href="/dashboard/my-contacts"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
              >
                <Users className="h-4 w-4" />
                My Contacts
              </Link>
            </div>
          )}
        </div>

        {/* User Section */}
        <div>
          <button
            onClick={() => setIsUserExpanded(!isUserExpanded)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black w-full text-left"
          >
            <Users className="h-4 w-4" />
            User
            {isUserExpanded ? (
              <ChevronDown className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-auto" />
            )}
          </button>
          {isUserExpanded && (
            <div className="ml-6 space-y-1">
              <Link
                href="/dashboard/user/create-user"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
              >
                <PlusCircle className="h-4 w-4" />
                Create User
              </Link>
              <Link
                href="/dashboard/user/user-list"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
              >
                <PlusCircle className="h-4 w-4" />
                User List
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom action */}
      <div className="p-4 border-t border-gray-500">
        {session.status === "authenticated" && (
          <Button
            variant="destructive"
            className="w-full justify-start gap-2 cursor-pointer"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        )}
      </div>
    </aside>
  );
}
