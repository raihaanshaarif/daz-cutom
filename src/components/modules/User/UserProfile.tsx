"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Shield,
  Activity,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loading from "@/components/ui/Loading";

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("id");

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError("No user ID provided");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5001/api/v1/user/${userId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "INACTIVE":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "BLOCK":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "INACTIVE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "BLOCK":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "USER":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mb-3">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-gray-500 text-sm">Error: {error}</p>
            <Button
              onClick={() => router.back()}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-lg mb-3">
              <UserIcon className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-sm">User not found</p>
            <Button
              onClick={() => router.back()}
              className="mt-4"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to User List
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-md">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              {user.name}
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className={getStatusColor(user.status)}>
                {getStatusIcon(user.status)}
                <span className="ml-1">{user.status}</span>
              </Badge>
              <Badge className={getRoleColor(user.role)}>
                <Shield className="w-3 h-3 mr-1" />
                {user.role.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
          {/* Profile Picture & Quick Stats */}
          <div className="space-y-12">
            <h3 className="text-xl font-bold "> STATS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-9 gap-1">
              {/* Today's Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      return (
                        contactDate.toDateString() === today.toDateString()
                      );
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Today&apos;s Contacts
                  </div>
                </CardContent>
              </Card>

              {/* This Week's Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const weekAgo = new Date(
                        today.getTime() - 7 * 24 * 60 * 60 * 1000,
                      );
                      return contactDate >= weekAgo;
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Week Contacts
                  </div>
                </CardContent>
              </Card>

              {/* This Month's Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const monthAgo = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1,
                      );
                      return contactDate >= monthAgo;
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Month Contacts
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Average Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">
                    {(() => {
                      const contacts = user.contacts || [];
                      if (contacts.length === 0) return 0;

                      const earliestDate = new Date(
                        Math.min(
                          ...contacts.map((c) =>
                            new Date(c.createdAt).getTime(),
                          ),
                        ),
                      );
                      const today = new Date();
                      const monthsDiff = Math.max(
                        1,
                        (today.getFullYear() - earliestDate.getFullYear()) *
                          12 +
                          (today.getMonth() - earliestDate.getMonth()) +
                          1,
                      );
                      const average = contacts.length / monthsDiff;
                      return average.toFixed(1);
                    })()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Monthly Average
                  </div>
                </CardContent>
              </Card>

              {/* Lifetime Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-indigo-600">
                    {user.contacts?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Lifetime Contacts
                  </div>
                </CardContent>
              </Card>

              {/* This Month Responded Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-teal-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const monthAgo = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1,
                      );
                      return (
                        contactDate >= monthAgo &&
                        contact.status === "RESPONDED"
                      );
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Month Responded
                  </div>
                </CardContent>
              </Card>

              {/* This Month Negotiating Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-amber-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const monthAgo = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1,
                      );
                      return (
                        contactDate >= monthAgo &&
                        contact.status === "NEGOTIATING"
                      );
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Month Negotiating
                  </div>
                </CardContent>
              </Card>

              {/* This Year Won Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-emerald-600">
                    {user.contacts?.filter((contact) => {
                      const contactDate = new Date(contact.createdAt);
                      const today = new Date();
                      const yearStart = new Date(today.getFullYear(), 0, 1);
                      return (
                        contactDate >= yearStart &&
                        contact.status === "CLOSED_WON"
                      );
                    }).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    This Year Won
                  </div>
                </CardContent>
              </Card>

              {/* Lifetime Won Contacts */}
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-cyan-600">
                    {user.contacts?.filter(
                      (contact) => contact.status === "CLOSED_WON",
                    ).length || 0}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Lifetime Won</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Recent Contacts Table */}
        <div className="mt-8">
          <div className="mb-4 text-center">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg mb-2 shadow-md">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
              Recent Contacts
            </h2>
            <p className="text-gray-500 text-sm">
              Latest contacts added by this user (showing up to 40)
            </p>
          </div>

          <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Country
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.contacts
                      ?.sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                      )
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage,
                      )
                      .map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {contact.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {contact.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {contact.company}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                contact.status === "CLOSED_WON"
                                  ? "bg-green-100 text-green-800"
                                  : contact.status === "NEGOTIATING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : contact.status === "RESPONDED"
                                      ? "bg-blue-100 text-blue-800"
                                      : contact.status === "CONTACTED"
                                        ? "bg-purple-100 text-purple-800"
                                        : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {contact.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {contact.country?.name || "N/A"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(contact.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {(!user.contacts || user.contacts.length === 0) && (
                  <div className="text-center py-8">
                    <UserIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No contacts found</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {user.contacts && user.contacts.length > itemsPerPage && (
                <div className="flex items-center justify-end space-x-2 py-4 border-t border-gray-200">
                  <div className="flex-1 text-sm text-muted-foreground">
                    Showing{" "}
                    {Math.min(
                      (currentPage - 1) * itemsPerPage + 1,
                      user.contacts.length,
                    )}{" "}
                    to{" "}
                    {Math.min(currentPage * itemsPerPage, user.contacts.length)}{" "}
                    of {user.contacts.length} contacts
                  </div>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage >=
                        Math.ceil(user.contacts.length / itemsPerPage)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
