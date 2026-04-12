"use client";

import { Parcel, Buyer, Courier } from "@/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { updateParcel } from "@/actions/create";
import { useSession } from "next-auth/react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

interface EditParcelModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditParcelModal({
  parcel,
  isOpen,
  onClose,
  onSuccess,
}: EditParcelModalProps) {
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState("");
  const [courierSearch, setCourierSearch] = useState("");
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const userRole = session?.user?.role ?? "";
  const { authFetch } = useAuthFetch();
  const [formData, setFormData] = useState({
    buyerId: "",
    courierCompanyId: "",
    trackingNumber: "",
    weight: "",
    description: "",
  });

  useEffect(() => {
    if (parcel) {
      setFormData({
        buyerId: parcel.buyerId.toString(),
        courierCompanyId: parcel.courierCompanyId.toString(),
        trackingNumber: parcel.trackingNumber,
        weight: parcel.weight.toString(),
        description: parcel.description,
      });
    }
  }, [parcel]);

  // Fetch buyers
  useEffect(() => {
    if (!userId || !userRole) return;
    const fetchBuyers = async () => {
      setLoadingBuyers(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          ...(buyerSearch && { search: buyerSearch }),
        });
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/order/buyers?${params}`,
          {
            cache: "no-store",
          },
        );
        const result = await res.json();
        const buyerData = result?.data || [];
        setBuyers(buyerData);
      } catch (error) {
        console.error("Failed to fetch buyers:", error);
      } finally {
        setLoadingBuyers(false);
      }
    };

    const debounceTimer = setTimeout(fetchBuyers, 300);
    return () => clearTimeout(debounceTimer);
  }, [buyerSearch, userId, userRole, authFetch]);

  // Fetch couriers
  useEffect(() => {
    if (!userId || !userRole) return;
    const fetchCouriers = async () => {
      setLoadingCouriers(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          ...(courierSearch && { search: courierSearch }),
        });
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies?${params}`,
          {
            cache: "no-store",
          },
        );
        const result = await res.json();
        const courierData = result?.data || [];
        setCouriers(courierData);
      } catch (error) {
        console.error("Failed to fetch couriers:", error);
      } finally {
        setLoadingCouriers(false);
      }
    };

    const debounceTimer = setTimeout(fetchCouriers, 300);
    return () => clearTimeout(debounceTimer);
  }, [courierSearch, userId, userRole, authFetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parcel) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append("buyerId", formData.buyerId);
      data.append("courierCompanyId", formData.courierCompanyId);
      data.append("trackingNumber", formData.trackingNumber);
      data.append("weight", formData.weight);
      data.append("description", formData.description);

      const result = await updateParcel(parcel.id, data);

      if (result?.data?.id || result?.id) {
        toast.success("Parcel updated successfully!", {
          description: "The parcel has been updated.",
          duration: 4000,
        });
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to update parcel", {
          description: "Please check your information and try again.",
        });
      }
    } catch (error) {
      console.error("Failed to update parcel:", error);
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Parcel
          </DialogTitle>
          <DialogDescription>
            Update the parcel information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Buyer Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Buyer *</Label>
              <Select
                value={formData.buyerId}
                onValueChange={(value) => handleInputChange("buyerId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a buyer" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search buyers..."
                      value={buyerSearch}
                      onChange={(e) => setBuyerSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {loadingBuyers ? (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Loading buyers...
                    </div>
                  ) : buyers.length > 0 ? (
                    buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id.toString()}>
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
              <Label className="text-sm font-medium">Courier Company *</Label>
              <Select
                value={formData.courierCompanyId}
                onValueChange={(value) =>
                  handleInputChange("courierCompanyId", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a courier company" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search courier companies..."
                      value={courierSearch}
                      onChange={(e) => setCourierSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
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
              <Label className="text-sm font-medium">Tracking Number *</Label>
              <Input
                value={formData.trackingNumber}
                onChange={(e) =>
                  handleInputChange("trackingNumber", e.target.value)
                }
                placeholder="Enter tracking number"
                required
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Weight (grams) *</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                placeholder="Enter weight in grams"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium">Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter parcel description"
                rows={3}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Parcel
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
