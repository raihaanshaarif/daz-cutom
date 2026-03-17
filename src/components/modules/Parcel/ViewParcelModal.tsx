"use client";

import { Parcel } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, User, Calendar, Hash, Weight } from "lucide-react";
import React from "react";

interface ViewParcelModalProps {
  parcel: Parcel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewParcelModal({
  parcel,
  isOpen,
  onClose,
}: ViewParcelModalProps) {
  if (!parcel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Parcel Details
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Tracking: {parcel.trackingNumber}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Parcel Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Tracking Number
                    </p>
                    <p className="text-sm text-gray-600 font-mono">
                      {parcel.trackingNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Weight className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Weight</p>
                    <p className="text-sm text-gray-600">
                      {parcel.weight} grams
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Buyer</p>
                    <p className="text-sm text-gray-600">
                      {parcel.buyer?.name || "N/A"}
                    </p>
                    {parcel.buyer?.brand && (
                      <p className="text-xs text-gray-500">
                        {parcel.buyer.brand}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Courier Company
                    </p>
                    <p className="text-sm text-gray-600">
                      {parcel.courierCompany?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      Description
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {parcel.description}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Created At
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(parcel.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Updated At
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(parcel.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
