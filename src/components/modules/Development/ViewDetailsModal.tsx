"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Calendar,
  Building,
  Tag,
  FileText,
  Clock,
  CheckCircle,
  Info,
} from "lucide-react";
import { DevelopmentSample } from "@/types";

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: DevelopmentSample | null;
}

export function ViewDetailsModal({
  isOpen,
  onClose,
  sample,
}: ViewDetailsModalProps) {
  if (!sample) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "SUBMITTED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "DROPPED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "ACTUAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "IMPORTED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Package className="w-6 h-6 text-indigo-600" />
            Development Sample Details
          </DialogTitle>
          <DialogDescription>
            Complete information for sample: {sample.style}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Info className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Style
                </label>
                <p className="text-sm font-semibold">{sample.style}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Style Name
                </label>
                <p className="text-sm">{sample.styleName || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Brand
                </label>
                <p className="text-sm">{sample.brand || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Color
                </label>
                <p className="text-sm">{sample.color || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Sizes
                </label>
                <p className="text-sm">{sample.sizes || "Not specified"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Season
                </label>
                <p className="text-sm">
                  {sample.seasonName} {sample.seasonYear}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Relations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="w-5 h-5" />
                Relations
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Buyer
                </label>
                <p className="text-sm font-semibold">
                  {sample.buyer?.name || `ID: ${sample.buyerId}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Factory
                </label>
                <p className="text-sm font-semibold">
                  {sample.factory?.name || `ID: ${sample.factoryId}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created By
                </label>
                <p className="text-sm font-semibold">
                  {sample.createdBy?.name || `ID: ${sample.createdById}`}
                </p>
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
              <div>
                <label className="text-sm font-medium text-gray-500">
                  SMS Status
                </label>
                <div className="mt-1">
                  <Badge className={getStatusColor(sample.smsStatus)}>
                    {sample.smsStatus}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Fabric Quality
                </label>
                <div className="mt-1">
                  <Badge className={getQualityColor(sample.fabricQuality)}>
                    {sample.fabricQuality}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Tag className="w-5 h-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="text-sm mt-1">
                  {sample.description || "Not specified"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Composition
                </label>
                <p className="text-sm mt-1">
                  {sample.composition || "Not specified"}
                </p>
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
              <div>
                <label className="text-sm font-medium text-gray-500">
                  SMS Deadline
                </label>
                <p className="text-sm">{formatDate(sample.smsDeadline)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  TP Receive Date
                </label>
                <p className="text-sm">{formatDate(sample.tpReceiveDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Original Swatch Date
                </label>
                <p className="text-sm">
                  {formatDate(sample.originalSwatchDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Original Sample Date
                </label>
                <p className="text-sm">
                  {formatDate(sample.originalSampleDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Labdip Receive Date
                </label>
                <p className="text-sm">
                  {formatDate(sample.labdipReceiveDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Lab Approval Date
                </label>
                <p className="text-sm">{formatDate(sample.labApprovalDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Print/Emb Strike Off
                </label>
                <p className="text-sm">
                  {formatDate(sample.printEmbStrikeOff)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  SMS Submission Date
                </label>
                <p className="text-sm">
                  {formatDate(sample.smsSubmissionDate)}
                </p>
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
              <div>
                <label className="text-sm font-medium text-gray-500">
                  User Remarks
                </label>
                <p className="text-sm mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {sample.userRemarks || "No user remarks"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Management Remarks
                </label>
                <p className="text-sm mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {sample.managementRemarks || "No management remarks"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Created At
                </label>
                <p className="text-sm">{formatDate(sample.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Updated At
                </label>
                <p className="text-sm">{formatDate(sample.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
