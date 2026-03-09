"use client";

import { Contact } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Contact Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <strong>Name:</strong> {contact.name || "-"}
          </div>
          <div>
            <strong>Email:</strong> {contact.email || "-"}
          </div>
          <div>
            <strong>Company:</strong> {contact.company || "-"}
          </div>
          <div>
            <strong>Designation:</strong> {contact.designation || "-"}
          </div>
          <div>
            <strong>Status:</strong> {contact.status}
          </div>
          <div>
            <strong>Country:</strong> {contact.country?.name || "-"}
          </div>
          <div>
            <strong>Notes:</strong> {contact.note || "-"}
          </div>
          <div>
            <strong>Last Contacted:</strong>{" "}
            {contact.lastContactedAt
              ? new Date(contact.lastContactedAt).toLocaleString()
              : "-"}
          </div>
          <div>
            <strong>Last Replied:</strong>{" "}
            {contact.lastRepliedAt
              ? new Date(contact.lastRepliedAt).toLocaleString()
              : "-"}
          </div>
          <div>
            <strong>Next Follow-up:</strong>{" "}
            {contact.nextFollowUpAt
              ? new Date(contact.nextFollowUpAt).toLocaleString()
              : "-"}
          </div>
          <div>
            <strong>Created At:</strong>{" "}
            {new Date(contact.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Updated At:</strong>{" "}
            {new Date(contact.updatedAt).toLocaleString()}
          </div>
        </div>
        <div className="mt-4 text-right">
          <Button variant="outline" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
