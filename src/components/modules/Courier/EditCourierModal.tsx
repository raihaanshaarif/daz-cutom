"use client";

import { Courier } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { updateCourier } from "@/actions/create";

interface EditCourierModalProps {
  courier: Courier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCourierModal({
  courier,
  isOpen,
  onClose,
  onSuccess,
}: EditCourierModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
  });

  useEffect(() => {
    if (courier) {
      setFormData({
        name: courier.name,
        address: courier.address,
        contactNumber: courier.contactNumber,
      });
    }
  }, [courier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courier) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("address", formData.address);
      data.append("contactNumber", formData.contactNumber);

      const result = await updateCourier(courier.id, data);

      if (result?.data?.id || result?.id) {
        toast.success("Courier updated successfully!", {
          description: "The courier company has been updated.",
          duration: 4000,
        });
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to update courier", {
          description: "Please check your information and try again.",
        });
      }
    } catch (error) {
      console.error("Failed to update courier:", error);
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
            Edit Courier Company
          </DialogTitle>
          <DialogDescription>
            Update the courier company information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Company Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter company name"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              Address *
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter address"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber" className="text-sm font-medium">
              Contact Number *
            </Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) =>
                handleInputChange("contactNumber", e.target.value)
              }
              placeholder="Enter contact number"
              required
              className="w-full"
            />
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
                  Update Courier
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
