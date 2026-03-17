"use client";
import { createParcel } from "@/actions/create";
import { Buyer, Courier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Truck, UserRoundPlus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CreateParcelForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [courierSearch, setCourierSearch] = useState("");
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";

  // Fetch buyers
  useEffect(() => {
    if (!userId || !session?.user?.role) return; // Wait for session to load
    const fetchBuyers = async () => {
      setLoadingBuyers(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          ...(buyerSearch && { search: buyerSearch }),
        });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/order/buyers?${params}`,
          {
            cache: "no-store",
            headers: {
              "user-id": userId,
              "user-role": session?.user?.role ?? "",
            },
          },
        );
        const result = await res.json();
        console.log("Fetched buyers:", result);
        const buyerData = Array.isArray(result) ? result : result.data || [];
        setBuyers(buyerData);
      } catch (error) {
        console.error("Failed to fetch buyers:", error);
      } finally {
        setLoadingBuyers(false);
      }
    };

    const debounceTimer = setTimeout(fetchBuyers, 300);
    return () => clearTimeout(debounceTimer);
  }, [buyerSearch, userId, session?.user?.role]);

  // Fetch couriers
  useEffect(() => {
    if (!userId || !session?.user?.role) return; // Wait for session to load
    const fetchCouriers = async () => {
      setLoadingCouriers(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          ...(courierSearch && { search: courierSearch }),
        });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies?${params}`,
          {
            cache: "no-store",
            headers: {
              "user-id": userId,
              "user-role": session?.user?.role ?? "",
            },
          },
        );
        const result = await res.json();
        console.log("Fetched couriers:", result);
        const courierData = Array.isArray(result) ? result : result.data || [];
        setCouriers(courierData);
      } catch (error) {
        console.error("Failed to fetch couriers:", error);
      } finally {
        setLoadingCouriers(false);
      }
    };

    const debounceTimer = setTimeout(fetchCouriers, 300);
    return () => clearTimeout(debounceTimer);
  }, [courierSearch, userId, session?.user?.role]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Add createdById from session
      formData.append("createdById", userId);

      const result = await createParcel(formData);
      console.log("createParcel result:", result);

      if (result?.data?.id || result?.id) {
        toast.success("Parcel created successfully!", {
          description: "The new parcel has been added to your list.",
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/parcel");
        }, 1500);
      } else {
        toast.error("Failed to create parcel", {
          description: "Please check your information and try again.",
        });
      }
    } catch {
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-2 shadow-md">
            <UserRoundPlus className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
            Create New Parcel
          </h1>
          <p className="text-gray-500 text-xs">
            Add a new parcel to track shipments.
          </p>
        </div>

        <form
          action={handleSubmit}
          className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden"
        >
          <div className="p-4 lg:p-6">
            {/* Parcel Details */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Parcel Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Buyer Selection */}
                <div className="space-y-2">
                  <Label
                    htmlFor="buyerSearch"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <UserRoundPlus className="w-3.5 h-3.5" />
                    Buyer *
                  </Label>

                  <Select name="buyerId" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingBuyers ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          Loading buyers...
                        </div>
                      ) : buyers.length > 0 ? (
                        buyers.map((buyer) => (
                          <SelectItem
                            key={buyer.id}
                            value={buyer.id.toString()}
                          >
                            {buyer.name} - {buyer.brand}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-gray-500">
                          No buyers found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Courier Company Selection */}
                <div className="space-y-2">
                  <Label
                    htmlFor="courierSearch"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Courier Company *
                  </Label>

                  <Select name="courierCompanyId" required>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a courier company" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCouriers ? (
                        <div className="p-2 text-center text-sm text-gray-500">
                          Loading couriers...
                        </div>
                      ) : couriers.length > 0 ? (
                        couriers.map((courier) => (
                          <SelectItem
                            key={courier.id}
                            value={courier.id.toString()}
                          >
                            {courier.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-center text-sm text-gray-500">
                          No courier companies found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tracking Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="trackingNumber"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Tracking Number *
                  </Label>
                  <Input
                    id="trackingNumber"
                    name="trackingNumber"
                    required
                    placeholder="Enter tracking number"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label
                    htmlFor="weight"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Weight (grams) *
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    required
                    placeholder="Enter weight in grams"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="description"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Package className="w-3.5 h-3.5" />
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    placeholder="Enter parcel description"
                    rows={3}
                    className="border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Parcel...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserRoundPlus className="w-5 h-5" />
                    Create Parcel
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
