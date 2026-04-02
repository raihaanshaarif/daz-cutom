"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { User } from "@/types";
import { EditUser } from "./index";
import { toast } from "sonner";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon, Plus, ChevronLeft, Filter, X } from "lucide-react";

const UserList = () => {
  const { authFetch } = useAuthFetch();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const router = useRouter();

  // Pagination & filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedRole && { role: selectedRole }),
      });

      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/user?${params.toString()}`,
        { cache: "no-store" },
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to fetch users");
      }

      const responseData = await res.json();
      // Support different response shapes
      const data =
        responseData?.data?.data || responseData?.data || responseData || [];
      const pagination =
        responseData?.data?.meta ||
        responseData?.pagination ||
        responseData?.meta;

      setUsers(Array.isArray(data) ? data : []);
      setTotalUsers(
        pagination?.total || (Array.isArray(data) ? data.length : 0),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [authFetch, currentPage, searchTerm, selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user: User) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleView = (user: User) => {
    router.push(`/dashboard/user/user-profile?id=${user.id}`);
  };

  const handleEditSuccess = () => {
    // Refetch users after successful edit
    fetchUsers();
  };

  const handleDelete = async (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/user/${user.id}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
        console.error("Error deleting user:", error);
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-8 px-4">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-[600px] w-full rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  // pagination handled by server via currentPage state

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedRole("");
    setCurrentPage(1);
  };

  const handleCreateUser = () => {
    router.push("/dashboard/user/create-user");
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                User List
              </h1>
              <p className="text-base text-zinc-500 dark:text-zinc-400">
                Manage platform users · {totalUsers} records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-11 px-5 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleCreateUser}
              className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 group rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              New User
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Search
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl transition-all"
            >
              {showFilters ? (
                <>
                  <X className="w-3.5 h-3.5 mr-2" />
                  Hide Filters
                </>
              ) : (
                <>
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  Show Filters
                </>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-end gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-72 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Search
                </Label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email"
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm"
                />
              </div>

              <div className="w-48 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Role
                </Label>
                <Select
                  value={selectedRole || "all"}
                  onValueChange={(v) => setSelectedRole(v === "all" ? "" : v)}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-auto space-y-2 min-w-[140px]">
                <div className="h-4" />
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 h-11 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:bg-zinc-100/80">
                  <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                    {users.length} / {totalUsers} Records
                  </span>
                </div>
              </div>

              {(searchTerm || selectedRole) && (
                <div className="space-y-2">
                  <div className="h-4" />
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="h-11 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 font-bold px-4 transition-all rounded-xl"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          )}

          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/60 dark:shadow-none rounded-[32px] bg-white dark:bg-zinc-900 overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800">
            <CardHeader className="pb-4 pt-8 px-8 border-b border-zinc-50 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Platform Users
                  </CardTitle>
                  <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
                    Browse and manage all registered users
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <DataTable
                data={users}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </div>

        <EditUser
          user={editUser}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
};

export default UserList;
