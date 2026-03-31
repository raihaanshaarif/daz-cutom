"use client";

import { Contact } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Globe,
  FileText,
  Calendar,
  Clock,
} from "lucide-react";
import React from "react";

interface ViewContactModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewContactModal({
  contact,
  isOpen,
  onClose,
}: ViewContactModalProps) {
  if (!contact) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Contact Details
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {contact.name} • {contact.company}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3 border-b bg-gray-50/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {contact.name || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email Address
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {contact.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {contact.company || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {contact.designation || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {contact.country?.name || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${contact.status === "QUALIFIED" ? "bg-green-500" : "bg-blue-500"}`}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Status
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {contact.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3 border-b bg-gray-50/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <FileText className="w-4 h-4" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 italic whitespace-pre-wrap">
                {contact.note || "No notes available for this contact."}
              </p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3 border-b bg-gray-50/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                Engagement Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Contacted
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {formatDate(contact.lastContactedAt as string)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-indigo-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Replied
                    </p>
                    <p className="text-sm text-gray-900 font-medium">
                      {formatDate(contact.lastRepliedAt as string)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Follow-up
                    </p>
                    <p className="text-sm text-gray-900 font-medium font-semibold">
                      {formatDate(contact.nextFollowUpAt as string)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Created By
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    {contact.author?.name || "—"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatDate(contact.createdAt as string)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest leading-none mb-1">
                    Modified By
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    {contact.modifiedBy?.name || "—"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatDate(contact.updatedAt as string)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
