"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

interface Buyer {
  id: number;
  name: string;
  brand: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const AssignUserForm = () => {
  const { authFetch } = useAuthFetch();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [buyerId, setBuyerId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBuyers(data);
        else setBuyers(data.data || []);
      });
    // Fetch users
    authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/user`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : data.data || []);
      });
  }, [authFetch]);

  // Assign user to buyer
  const handleAssign = async () => {
    if (!buyerId || !userId) {
      toast.error("Please select both buyer and user.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/order/buyers/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: Number(userId),
            buyerId: Number(buyerId),
          }),
        },
      );
      const result = await res.json();
      if (res.ok) {
        toast.success("User assigned to buyer successfully!");
        setBuyerId("");
        setUserId("");
      } else {
        toast.error(result?.message || "Failed to assign user.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Deassign user from buyer
  const handleDeassign = async () => {
    if (!buyerId || !userId) {
      toast.error("Please select both buyer and user.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/order/buyers/assign`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: Number(userId),
            buyerId: Number(buyerId),
          }),
        },
      );
      let result = null;
      try {
        result = await res.json();
      } catch {
        // If response is not JSON, log the raw text
        const text = await res.text();
        console.error("Deassign response not JSON:", text);
      }
      if (res.ok) {
        toast.success("User deassigned from buyer successfully!");
        setBuyerId("");
        setUserId("");
      } else {
        console.error("Deassign error:", result);
        toast.error(result?.message || "Failed to deassign user.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
      console.error("Deassign fetch error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAssign();
  };

  return (
    <div className="min-h-screen bg-background py-2 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-semibold mb-1">Assign User to Buyer</h1>
          <p className="text-gray-500 text-xs">
            Select a buyer and a user to assign.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/95 rounded-xl shadow-sm border border-gray-200/50 overflow-hidden"
        >
          <div className="p-4 lg:p-6 space-y-6">
            {/* Buyer Select */}
            <div className="space-y-2">
              <Label htmlFor="buyer">Select Buyer *</Label>
              <Select value={buyerId} onValueChange={setBuyerId}>
                <SelectTrigger id="buyer" className="w-full">
                  <SelectValue placeholder="Choose a buyer" />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((buyer) => (
                    <SelectItem key={buyer.id} value={buyer.id.toString()}>
                      {buyer.name} ({buyer.brand})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* User Select */}
            <div className="space-y-2">
              <Label htmlFor="user">Select User *</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger id="user" className="w-full">
                  <SelectValue placeholder="Choose a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
              <Button
                type="button"
                disabled={isSubmitting}
                className="h-9 px-5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-200"
                onClick={handleDeassign}
              >
                {isSubmitting ? "Deassigning..." : "Deassign User"}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm rounded-lg shadow-sm transition-all duration-200"
              >
                {isSubmitting ? "Assigning..." : "Assign User"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignUserForm;
