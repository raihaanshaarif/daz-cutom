"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { User } from "@/types";
import Loading from "@/components/ui/Loading";
import { EditUser } from "./index";
import { toast } from "sonner";

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/v1/user`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
        const response = await fetch(
          `http://localhost:5001/api/v1/user/${user.id}`,
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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">User List</h1>
      <DataTable
        data={users}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
      <EditUser
        user={editUser}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default UserList;
