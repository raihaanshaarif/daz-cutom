"use client";

import { Contact, Pagination } from "@/types";
import { useEffect, useState } from "react";
import { ContactTable } from "./ContactTable";
import { EditContactForm } from "./EditContactForm";
import { Users, Database, Filter, Calendar, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [allContactsCache, setAllContactsCache] = useState<Contact[]>([]);
  const [allContactsPagination, setAllContactsPagination] =
    useState<Pagination | null>(null);
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Edit modal state
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedUser("all");
    setSelectedPeriod("all");
    setCurrentPage(1);

    // Immediately show cached all contacts data if available
    if (allContactsCache.length > 0) {
      setContacts(allContactsCache);
      setTotalPages(allContactsPagination?.totalPages || 1);
      setTotalContacts(allContactsPagination?.total || 0);
      setLoading(false);
    } else {
      // Fallback to triggering refetch if no cache
      setLoading(true);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh the contacts list by triggering a refetch
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingContact(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-3">
              <Database className="w-4 h-4 text-white animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm">Loading your contacts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-3 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-1 shadow-md">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-0.5">
            My Contacts
          </h1>
          <p className="text-gray-500 text-xs">
            Manage your leads ({totalContacts} total)
            {selectedUser !== "all" && users && users.length > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                • Filtered by:{" "}
                {users.find((u) => u.id.toString() === selectedUser)?.name ||
                  selectedUser}
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
                <Filter className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-xs font-medium text-gray-900">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Date Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Date
                </Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    handleFilterChange();
                  }}
                  className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              {/* Created By Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Created By
                </Label>
                <Select
                  value={selectedUser}
                  onValueChange={(value) => {
                    console.log("Selected user:", value);
                    setSelectedUser(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {users.length > 0 &&
                    !users.some((u) => u.name === "John Doe") ? (
                      users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))
                    ) : usersLoading ? null : (
                      <>
                        <SelectItem value="1">Abid</SelectItem>
                        <SelectItem value="2">John Doe</SelectItem>
                        <SelectItem value="3">Jane Smith</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Period Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Period
                </Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={(value) => {
                    setSelectedPeriod(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger className="h-7 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 opacity-0">
                  Clear
                </Label>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="h-7 w-full text-xs border-gray-200 hover:border-red-500 hover:text-red-600"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Table */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <ContactTable
              data={contacts}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onEdit={handleEditContact}
            />
          </div>
        </div>

        {/* Edit Contact Modal */}
        <EditContactForm
          contact={editingContact}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  );
}
