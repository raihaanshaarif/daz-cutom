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
import {
  Calendar,
  FileText,
  Package,
  CreditCard,
  Clock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Shield,
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
    case "partially_paid":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "pending":
      return "bg-red-100 text-red-800 border-red-200";
    case "ready":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "sent":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "preparing":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "surrendered":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return <CheckCircle className="w-3 h-3" />;
    case "partial":
    case "partially_paid":
      return <AlertCircle className="w-3 h-3" />;
    case "pending":
      return <XCircle className="w-3 h-3" />;
    case "surrendered":
      return <Shield className="w-3 h-3" />;
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Invoice Details: {commercial.invoiceNo}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {commercial.bookingReference}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3 border-b bg-gray-50/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Package className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Reference
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.bookingReference || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice No
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.invoiceNo || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Price
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      ${commercial.totalPrice?.toLocaleString() ?? "0"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.quantity?.toLocaleString() ?? "0"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3 border-b bg-gray-50/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <CreditCard className="w-4 h-4" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wider">
                    LAC Amount
                  </p>
                  <p className="text-lg font-bold text-green-700 mt-1">
                    ${commercial.lacAmount?.toLocaleString() ?? "0"}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                    Received Amount
                  </p>
                  <p className="text-lg font-bold text-blue-700 mt-1">
                    ${commercial.receivedAmount?.toLocaleString() ?? "0"}
                  </p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wider">
                    Balance
                  </p>
                  <p className="text-lg font-bold text-red-700 mt-1">
                    ${commercial.balance?.toLocaleString() ?? "0"}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600">
                    Payment Status
                  </p>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(commercial.paymentStatus)} flex items-center gap-1`}
                  >
                    {getStatusIcon(commercial.paymentStatus)}
                    {commercial.paymentStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader className="pb-3 border-b bg-gray-50/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Date
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.bookingDate
                        ? new Date(commercial.bookingDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ETD
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.etd
                        ? new Date(commercial.etd).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ETA
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.eta
                        ? new Date(commercial.eta).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(commercial.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader className="pb-3 border-b bg-gray-50/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Status
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {commercial.documentStatus}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doc Courier No
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.docCourierNo || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking Handover Date
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.bookingHandoverDate
                        ? new Date(
                            commercial.bookingHandoverDate,
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Handover Date
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.handoverDate
                        ? new Date(commercial.handoverDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approx. Payment Date
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.approximatePaymentDate
                        ? new Date(
                            commercial.approximatePaymentDate,
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Received Date
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {commercial.receivedDate
                        ? new Date(commercial.receivedDate).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {commercial.remarks && (
                <div className="mt-6 p-4 bg-zinc-900 text-zinc-50 rounded-xl">
                  <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                    Remarks
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {commercial.remarks}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Associated Orders */}
          {commercial.orders && commercial.orders.length > 0 && (
            <Card>
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <Package className="w-4 h-4" />
                  Associated Orders ({commercial.orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {commercial.orders.map((co) => (
                    <div
                      key={co.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-100 rounded-md">
                          <Package className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">
                            {co.order?.orderNumber || `Order #${co.orderId}`}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {co.order?.buyer?.name} • {co.order?.style}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-zinc-900">
                          {co.order?.quantity} Units
                        </p>
                        <p className="text-xs text-zinc-500">
                          ${co.order?.totalPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
