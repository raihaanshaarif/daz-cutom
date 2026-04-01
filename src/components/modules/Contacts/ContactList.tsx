"use client";

import { Contact, Pagination } from "@/types";
import { useEffect, useState } from "react";
import { ContactTable } from "./ContactTable";
import { EditContactForm } from "./EditContactForm";
import { ViewContactModal } from "./ViewContactModal";
import {
  Users,
  Database,
  Filter,
  Calendar,
  User,
  X,
  UserPlus,
  Plus,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { deleteContact } from "@/actions/create";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const limit = 10;

  // Filter states
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [allContactsCache, setAllContactsCache] = useState<Contact[]>([]);
  const [allContactsPagination, setAllContactsPagination] =
    useState<Pagination | null>(null);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();

  // Edit modal state
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // View modal state
  const [viewContact, setViewContact] = useState<Contact | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if any filters are active
  const hasActiveFilters =
    selectedDate || selectedUser !== "all" || selectedPeriod !== "all";

  const handleCreateContact = () => {
    router.push("/dashboard/contact/create-contact");
  };

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true); // Ensure loading state when filters change
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
        });

        if (selectedUser && selectedUser !== "all") {
          params.append("authorId", selectedUser);
          console.log(
            "Filtering by user ID:",
            selectedUser,
            "Type:",
            typeof selectedUser,
          );
        }

        const queryString = params.toString();
        console.log("API call with params:", queryString);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/contact?${queryString}`,
          {
            cache: "no-store",
          },
        );
        const { data, pagination } = await res.json();
        console.log("API response data:", data);
        console.log("Number of contacts returned:", data?.length || 0);

        let filteredData = data || [];

        // If API doesn't support filtering, filter on frontend as fallback
        if (selectedUser && selectedUser !== "all") {
          filteredData = filteredData.filter(
            (contact: Contact) =>
              contact.authorId?.toString() === selectedUser ||
              contact.author?.id?.toString() === selectedUser,
          );
          console.log("Frontend filtered to:", filteredData.length, "contacts");
        }

        setContacts(filteredData);
        setTotalPages(pagination?.totalPages || 1);
        setTotalContacts(
          selectedUser && selectedUser !== "all"
            ? filteredData.length
            : pagination?.total || 0,
        );

        // Cache all contacts data when no filters are applied
        if (
          selectedUser === "all" &&
          selectedPeriod === "all" &&
          !selectedDate
        ) {
          setAllContactsCache(filteredData);
          setAllContactsPagination(pagination);
        }
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [currentPage, selectedDate, selectedUser, selectedPeriod, refreshTrigger]);

  useEffect(() => {
    // Fetch users for the created by filter
    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        // Try multiple possible endpoints
        const endpoints = [
          `${process.env.NEXT_PUBLIC_BASE_API}/user`,
          `${process.env.NEXT_PUBLIC_BASE_API}/users`,
          `${process.env.NEXT_PUBLIC_BASE_API}/api/user`,
          `${process.env.NEXT_PUBLIC_BASE_API}/api/users`,
          `${process.env.NEXT_PUBLIC_BASE_API}/user/list`,
          `${process.env.NEXT_PUBLIC_BASE_API}/users/list`,
        ];

        let usersData = null;
        let successfulEndpoint = "";

        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            const res = await fetch(endpoint, {
              cache: "no-store",
            });

            if (res.ok) {
              const data = await res.json();
              console.log(`Success from ${endpoint}:`, data);

              // Handle different response structures
              const usersArray = Array.isArray(data)
                ? data
                : data?.data || data?.users || [];

              if (usersArray.length > 0) {
                usersData = usersArray;
                successfulEndpoint = endpoint;
                break;
              }
            }
          } catch (err) {
            console.log(`Failed ${endpoint}:`, err);
            continue;
          }
        }

        if (usersData) {
          console.log(`Using users from ${successfulEndpoint}:`, usersData);
          setUsers(usersData);
        } else {
          // Try to extract users from contacts API
          console.log("Trying to get users from contacts...");
          try {
            const contactsRes = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_API}/contact?page=1&limit=100`,
              { cache: "no-store" },
            );

            if (contactsRes.ok) {
              const contactsData = await contactsRes.json();
              const contacts = Array.isArray(contactsData)
                ? contactsData
                : contactsData?.data || [];

              // Extract unique users from contacts
              const uniqueUsers = new Map();
              contacts.forEach((contact: Contact) => {
                if (
                  contact.author &&
                  contact.author.id &&
                  contact.author.name
                ) {
                  uniqueUsers.set(contact.author.id, {
                    id: contact.author.id,
                    name: contact.author.name,
                  });
                }
              });

              const extractedUsers = Array.from(uniqueUsers.values());
              if (extractedUsers.length > 0) {
                console.log("Extracted users from contacts:", extractedUsers);
                setUsers(extractedUsers);
                setUsersLoading(false);
                return;
              }
            }
          } catch (err) {
            console.log("Failed to extract users from contacts:", err);
          }

          // Final fallback
          console.log("Using fallback mock users");
          setUsers([
            { id: 1, name: "Abid" },
            { id: 2, name: "John Doe" },
            { id: 3, name: "Jane Smith" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([
          { id: 1, name: "Abid" },
          { id: 2, name: "John Doe" },
          { id: 3, name: "Jane Smith" },
        ]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when filters change
    setLoading(true);
  };

  const clearAllFilters = () => {
    setSelectedDate("");
    setSelectedUser("all");
    setSelectedPeriod("all");
    setSelectedType("all");
    setCurrentPage(1);
    setLoading(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditModalOpen(true);
  };

  const handleViewContact = (contact: Contact) => {
    setViewContact(contact);
    setIsViewModalOpen(true);
  };

  const handleDeleteContact = async (contact: Contact) => {
    if (confirm(`Are you sure you want to delete contact ${contact.name}?`)) {
      try {
        const result = await deleteContact(contact.id);
        if (result?.success || result?.message) {
          toast.success("Contact deleted successfully!");
          setRefreshTrigger((prev) => prev + 1);
        } else {
          toast.error("Failed to delete contact");
        }
      } catch {
        toast.error("An error occurred while deleting the contact");
      }
    }
  };

  const handleEditSuccess = () => {
    // Refresh the contacts list by triggering a refetch
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingContact(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewContact(null);
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
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

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-110">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 ">
                Contact Lead
              </h1>
              <p className="text-base text-zinc-500 dark:text-zinc-400">
                Manage your network of {totalContacts} professional contacts
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
              onClick={handleCreateContact}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 group rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
              Create New Lead
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Header for Filter Section */}
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters & Search
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
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

          {/* Enhanced Filter Bar */}
          {showFilters && (
            <div className="flex flex-wrap items-end gap-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-64 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Follow-up Date
                </Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    handleFilterChange();
                  }}
                  className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-blue-500/20"
                />
              </div>

              <div className="w-56 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Lead Type
                </Label>
                <Select
                  value={selectedType}
                  onValueChange={(val) => {
                    setSelectedType(val);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-blue-500/20">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All Types
                    </SelectItem>
                    <SelectItem value="Buyer" className="rounded-lg">
                      Buyer
                    </SelectItem>
                    <SelectItem value="Factory" className="rounded-lg">
                      Factory
                    </SelectItem>
                    <SelectItem value="Courier" className="rounded-lg">
                      Courier
                    </SelectItem>
                    <SelectItem value="Other" className="rounded-lg">
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-64 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Created By
                </Label>
                <Select
                  value={selectedUser}
                  onValueChange={(value) => {
                    setSelectedUser(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-11 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 rounded-xl text-sm shadow-sm transition-all focus:ring-blue-500/20">
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-2xl p-1">
                    <SelectItem value="all" className="rounded-lg">
                      All users
                    </SelectItem>
                    {users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id.toString()}
                        className="rounded-lg"
                      >
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="space-y-2">
                  <div className="h-4" />
                  <Button
                    onClick={clearAllFilters}
                    variant="ghost"
                    size="sm"
                    className="h-11 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 font-bold px-4 transition-all rounded-xl shadow-sm hover:shadow-md"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              <div className="ml-auto space-y-2 min-w-[140px]">
                <div className="h-4" />
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 h-11 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm transition-all hover:bg-zinc-100/80">
                  <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                    {contacts.length} / {totalContacts} Records
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Table Content */}
          <Card className="border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/60 dark:shadow-none rounded-[32px] bg-white dark:bg-zinc-900 overflow-hidden ring-1 ring-zinc-100 dark:ring-zinc-800">
            <CardHeader className="pb-4 pt-8 px-8 border-b border-zinc-50 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Lead Database
                  </CardTitle>
                  <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
                    Search and manage your business Lead information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <ContactTable
                data={contacts}
                currentPage={currentPage}
                totalPages={allContactsPagination?.totalPages || 1}
                onPageChange={handlePageChange}
                onEdit={handleEditContact}
                onView={handleViewContact}
                onDelete={handleDeleteContact}
              />
            </CardContent>
          </Card>
        </div>

        {/* Modals and Dialogs */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
            {editingContact && (
              <EditContactForm
                contact={editingContact}
                onClose={handleCloseEditModal}
                onSuccess={handleEditSuccess}
                isOpen={isEditModalOpen}
              />
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
            <DialogHeader className="pb-4 border-b border-zinc-100">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Users className="w-5 h-5" />
                </div>
                Contact Profile: {viewContact?.name}
              </DialogTitle>
            </DialogHeader>
            {viewContact && (
              <div className="py-6 min-h-[400px]">
                <ViewContactModal
                  contact={viewContact}
                  onClose={handleCloseViewModal}
                  isOpen={isViewModalOpen}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
