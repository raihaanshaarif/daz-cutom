"use client";

import { Commercial } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  DollarSign,
  FileText,
  Package,
  Truck,
  CreditCard,
  Clock,
  User,
  Building,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import React from "react";

interface ViewCommercialModalProps {
  commercial: Commercial | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-200";
    case "partial":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "pending":
      return "bg-red-100 text-red-800 border-red-200";
    case "ready":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "sent":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "preparing":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return <CheckCircle className="w-3 h-3" />;
    case "partial":
      return <AlertCircle className="w-3 h-3" />;
    case "pending":
      return <XCircle className="w-3 h-3" />;
    default:
      return null;
  }
};

export function ViewCommercialModal({
  commercial,
  isOpen,
  onClose,
}: ViewCommercialModalProps) {
  if (!commercial) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Commercial Details
                </DialogTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {commercial.bookingReference}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${getStatusColor(commercial.documentStatus)} flex items-center gap-1`}
            >
              {getStatusIcon(commercial.documentStatus)}
              {commercial.documentStatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Basic Information
              </CardTitle>
              <Separator className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Booking Reference
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {commercial.bookingReference}
                    </div>
                    <Separator />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Invoice No
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {commercial.invoiceNo}
                    </div>
                    <Separator />
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Total Price
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      ${commercial.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      LAC Amount
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ${commercial.lacAmount.toLocaleString()}
                    </div>
                    <Separator />
                  </div> */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Doc Courier No
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {commercial.docCourierNo || "-"}
                    </div>
                    <Separator />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Quantity
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {commercial.quantity.toLocaleString()}
                    </div>
                    <Separator />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Remarks
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {commercial.remarks || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Important Dates
              </CardTitle>
              <Separator className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                    Booking Date
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(commercial.bookingDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-green-600 uppercase tracking-wide">
                    Booking Handover
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(
                      commercial.bookingHandoverDate,
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                    Handover Date
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(commercial.handoverDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                    ETD
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(commercial.etd).toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-red-600 uppercase tracking-wide">
                    ETA
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(commercial.eta).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Payment Information
              </CardTitle>
              <Separator className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Payment Status
                    </span>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(commercial.paymentStatus)} flex items-center gap-1`}
                    >
                      {getStatusIcon(commercial.paymentStatus)}
                      {commercial.paymentStatus}
                    </Badge>
                  </div>
                  {/* LAC Amount under payment info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      LAC Amount
                    </div>
                    <div className="text-sm font-semibold">
                      ${commercial.lacAmount?.toLocaleString() || "0"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Received Amount
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ${commercial.receivedAmount?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Received Date
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(commercial.receivedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      Approximate Payment Date
                    </div>
                    <div className="text-sm font-semibold">
                      {commercial.approximatePaymentDate
                        ? new Date(
                            commercial.approximatePaymentDate,
                          ).toLocaleDateString()
                        : "Not set"}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">
                      Balance
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      ${commercial.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Associated Orders */}
          {commercial.orders && commercial.orders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Associated Orders ({commercial.orders.length})
                </CardTitle>
                <Separator className="mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {commercial.orders.map((co) => (
                    <div
                      key={co.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {co.order?.orderNumber}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {co.order?.style}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Buyer:</span>
                              <div className="font-medium">
                                {co.order?.buyer?.name}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Quantity:</span>
                              <div className="font-medium">
                                {co.order?.quantity?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Price:</span>
                              <div className="font-medium">
                                ${co.order?.price?.toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Total:</span>
                              <div className="font-medium text-green-600">
                                ${co.order?.totalPrice?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Record Information
              </CardTitle>
              <Separator className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Created At
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(commercial.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Updated At
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">
                    {new Date(commercial.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
