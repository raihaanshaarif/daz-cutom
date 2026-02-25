"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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
  console.log(session);
  const router = useRouter();
  const [isUserExpanded, setIsUserExpanded] = useState(false);
  const [isBuyerExpanded, setIsBuyerExpanded] = useState(false);
  const [isCountryExpanded, setIsCountryExpanded] = useState(false);

  const handleMyProfile = () => {
    if (session.data?.user?.id) {
      router.push(`/dashboard/user/user-profile?id=${session.data.user.id}`);
    }
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-black text-white">
      {/* Top navigation */}
      <nav className="flex-1 space-y-2 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
        >
          <Home className="h-4 w-4" />
          Dashboard
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
                href="/dashboard/contact/create-contact"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
              >
                <PlusCircle className="h-4 w-4" />
                Create Contact
              </Link>

              <Link
                href="/dashboard/contact/my-contacts"
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

        {/* Country Section */}
        <div>
          <button
            onClick={() => setIsCountryExpanded(!isCountryExpanded)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black w-full text-left"
          >
            <Users className="h-4 w-4" />
            Country
            {isBuyerExpanded ? (
              <ChevronDown className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-auto" />
            )}
          </button>
          {isCountryExpanded && (
            <div className="ml-6 space-y-1">
              <Link
                href="/dashboard/country/create-country"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
              >
                <PlusCircle className="h-4 w-4" />
                Create Country
              </Link>

              <Link
                href="/dashboard/country/country-list"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 hover:text-black"
              >
                <Users className="h-4 w-4" />
                Country List
              </Link>
            </div>
          )}
        </div>

        {/* User Section */}
      </nav>
      {/* Bottom action */}
      <div className="p-4 ">
        {session.status === "authenticated" && (
          <Button
            className="w-full justify-start gap-2 cursor-pointer"
            onClick={handleMyProfile}
          >
            My Profile
          </Button>
        )}
      </div>

      {/* Bottom action */}
      <div className="p-4 border-t border-gray-500">
        {session.status === "authenticated" && (
          <Button
            variant="secondary"
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
