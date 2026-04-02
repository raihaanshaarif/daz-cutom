"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Calendar,
  Tag,
  FileText,
  CheckCircle,
  Save,
  X,
} from "lucide-react";
import { DevelopmentSample, Buyer, Factory } from "@/types";
import { toast } from "sonner";
import { updateDevelopmentSample } from "@/actions/create";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: DevelopmentSample | null;
  onSuccess: () => void;
}

export function EditModal({
  isOpen,
  onClose,
  sample,
  onSuccess,
}: EditModalProps) {
  const { authFetch } = useAuthFetch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [formData, setFormData] = useState({
    buyerId: "",
    factoryId: "",
    style: "",
    styleName: "",
    seasonName: "",
    seasonYear: "",
    brand: "",
    description: "",
    composition: "",
    sizes: "",
    color: "",
    smsDeadline: "",
    tpReceiveDate: "",
    originalSwatchDate: "",
    originalSampleDate: "",
    labdipReceiveDate: "",
    labApprovalDate: "",
    printEmbStrikeOff: "",
    smsSubmissionDate: "",
    fabricQuality: "",
    smsStatus: "",
    userRemarks: "",
    managementRemarks: "",
  });

  // Load buyers and factories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [buyersResponse, factoriesResponse] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`),
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/factories`),
        ]);

        const buyersData = await buyersResponse.json();
        const factoriesData = await factoriesResponse.json();

        setBuyers(Array.isArray(buyersData) ? buyersData : []);
        setFactories(Array.isArray(factoriesData) ? factoriesData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  // Populate form when sample changes
  useEffect(() => {
    if (sample) {
      setFormData({
        buyerId: sample.buyerId.toString(),
        factoryId: sample.factoryId.toString(),
        style: sample.style,
        styleName: sample.styleName || "",
        seasonName: sample.seasonName,
        seasonYear: sample.seasonYear.toString(),
        brand: sample.brand || "",
        description: sample.description || "",
        composition: sample.composition || "",
        sizes: sample.sizes || "",
        color: sample.color || "",
        smsDeadline: sample.smsDeadline ? sample.smsDeadline.split("T")[0] : "",
        tpReceiveDate: sample.tpReceiveDate
          ? sample.tpReceiveDate.split("T")[0]
          : "",
        originalSwatchDate: sample.originalSwatchDate
          ? sample.originalSwatchDate.split("T")[0]
          : "",
        originalSampleDate: sample.originalSampleDate
          ? sample.originalSampleDate.split("T")[0]
          : "",
        labdipReceiveDate: sample.labdipReceiveDate
          ? sample.labdipReceiveDate.split("T")[0]
          : "",
        labApprovalDate: sample.labApprovalDate
          ? sample.labApprovalDate.split("T")[0]
          : "",
        printEmbStrikeOff: sample.printEmbStrikeOff
          ? sample.printEmbStrikeOff.split("T")[0]
          : "",
        smsSubmissionDate: sample.smsSubmissionDate
          ? sample.smsSubmissionDate.split("T")[0]
          : "",
        fabricQuality: sample.fabricQuality,
        smsStatus: sample.smsStatus,
        userRemarks: sample.userRemarks || "",
        managementRemarks: sample.managementRemarks || "",
      });
    }
  }, [sample]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sample) return;

    setIsSubmitting(true);
    try {
      const updateData = new FormData();

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          updateData.append(key, value);
        }
      });

      // Add the ID for the update
      updateData.append("id", sample.id.toString());

      const result = await updateDevelopmentSample(updateData);

      if (result?.success) {
        toast.success("Sample updated successfully!", {
          description: `Sample ${sample.style} has been updated.`,
        });
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to update sample", {
          description:
            result?.message || "Please check your information and try again.",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!sample) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Package className="w-6 h-6 text-indigo-600" />
            Edit Development Sample
          </DialogTitle>
          <DialogDescription>
            Update information for sample: {sample.style}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyerId">Buyer *</Label>
                <Select
                  value={formData.buyerId}
                  onValueChange={(value) => handleInputChange("buyerId", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Buyer" />
                  </SelectTrigger>
                  <SelectContent>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id.toString()}>
                        {buyer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="factoryId">Factory *</Label>
                <Select
                  value={formData.factoryId}
                  onValueChange={(value) =>
                    handleInputChange("factoryId", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Factory" />
                  </SelectTrigger>
                  <SelectContent>
                    {factories.map((factory) => (
                      <SelectItem
                        key={factory.id}
                        value={factory.id.toString()}
                      >
                        {factory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Style *</Label>
                <Input
                  id="style"
                  value={formData.style}
                  onChange={(e) => handleInputChange("style", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="styleName">Style Name</Label>
                <Input
                  id="styleName"
                  value={formData.styleName}
                  onChange={(e) =>
                    handleInputChange("styleName", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seasonName">Season Name *</Label>
                <Select
                  value={formData.seasonName}
                  onValueChange={(value) =>
                    handleInputChange("seasonName", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Season" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPRING">Spring</SelectItem>
                    <SelectItem value="SUMMER">Summer</SelectItem>
                    <SelectItem value="AUTUMN">Autumn</SelectItem>
                    <SelectItem value="WINTER">Winter</SelectItem>
                    <SelectItem value="RESORT">Resort</SelectItem>
                    <SelectItem value="PRE_FALL">Pre-Fall</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seasonYear">Season Year *</Label>
                <Input
                  id="seasonYear"
                  type="number"
                  value={formData.seasonYear}
                  onChange={(e) =>
                    handleInputChange("seasonYear", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sizes">Sizes</Label>
                <Input
                  id="sizes"
                  value={formData.sizes}
                  onChange={(e) => handleInputChange("sizes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="composition">Composition</Label>
                <Textarea
                  id="composition"
                  value={formData.composition}
                  onChange={(e) =>
                    handleInputChange("composition", e.target.value)
                  }
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status & Quality */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5" />
                Status & Quality
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smsStatus">SMS Status</Label>
                <Select
                  value={formData.smsStatus}
                  onValueChange={(value) =>
                    handleInputChange("smsStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="DROPPED">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fabricQuality">Fabric Quality</Label>
                <Select
                  value={formData.fabricQuality}
                  onValueChange={(value) =>
                    handleInputChange("fabricQuality", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="ACTUAL">Actual</SelectItem>
                    <SelectItem value="IMPORTED">Imported</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Deadlines & Tracking Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5" />
                Deadlines & Tracking Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smsDeadline">SMS Deadline</Label>
                <Input
                  id="smsDeadline"
                  type="date"
                  value={formData.smsDeadline}
                  onChange={(e) =>
                    handleInputChange("smsDeadline", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tpReceiveDate">TP Receive Date</Label>
                <Input
                  id="tpReceiveDate"
                  type="date"
                  value={formData.tpReceiveDate}
                  onChange={(e) =>
                    handleInputChange("tpReceiveDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalSwatchDate">Original Swatch Date</Label>
                <Input
                  id="originalSwatchDate"
                  type="date"
                  value={formData.originalSwatchDate}
                  onChange={(e) =>
                    handleInputChange("originalSwatchDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalSampleDate">Original Sample Date</Label>
                <Input
                  id="originalSampleDate"
                  type="date"
                  value={formData.originalSampleDate}
                  onChange={(e) =>
                    handleInputChange("originalSampleDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="labdipReceiveDate">Labdip Receive Date</Label>
                <Input
                  id="labdipReceiveDate"
                  type="date"
                  value={formData.labdipReceiveDate}
                  onChange={(e) =>
                    handleInputChange("labdipReceiveDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="labApprovalDate">Lab Approval Date</Label>
                <Input
                  id="labApprovalDate"
                  type="date"
                  value={formData.labApprovalDate}
                  onChange={(e) =>
                    handleInputChange("labApprovalDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="printEmbStrikeOff">Print/Emb Strike Off</Label>
                <Input
                  id="printEmbStrikeOff"
                  type="date"
                  value={formData.printEmbStrikeOff}
                  onChange={(e) =>
                    handleInputChange("printEmbStrikeOff", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsSubmissionDate">SMS Submission Date</Label>
                <Input
                  id="smsSubmissionDate"
                  type="date"
                  value={formData.smsSubmissionDate}
                  onChange={(e) =>
                    handleInputChange("smsSubmissionDate", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userRemarks">User Remarks</Label>
                <Textarea
                  id="userRemarks"
                  value={formData.userRemarks}
                  onChange={(e) =>
                    handleInputChange("userRemarks", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="managementRemarks">Management Remarks</Label>
                <Textarea
                  id="managementRemarks"
                  value={formData.managementRemarks}
                  onChange={(e) =>
                    handleInputChange("managementRemarks", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Sample
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
