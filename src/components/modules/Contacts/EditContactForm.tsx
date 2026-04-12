"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Contact, Country, ContactFormData } from "@/types";
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
import { useAuthFetch } from "@/hooks/use-auth-fetch";

interface EditContactFormProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditContactForm({
  contact,
  isOpen,
  onClose,
  onSuccess,
}: EditContactFormProps) {
  const { authFetch } = useAuthFetch();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    designation: "",
    company: "",
    domain: "",
    country: undefined,
    companyLinkedin: "",
    personalLinkedin: "",
    status: "NOT_CONTACTED",
    note: "",
    lastContactedAt: undefined,
    lastRepliedAt: undefined,
    nextFollowUpAt: undefined,
  });

  const formatStatus = (status: string) => {
    return status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/country`,
        );
        if (res.ok) {
          const data = await res.json();
          const countriesArray = data?.data || [];
          setCountries(countriesArray);
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    if (isOpen) {
      fetchCountries();
    }
  }, [isOpen, authFetch]);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Returns yyyy-MM-dd format
  };

  // Populate form when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email,
        designation: contact.designation || "",
        company: contact.company,
        domain: contact.domain || "",
        country: contact.country?.id,
        companyLinkedin: contact.companyLinkedin || "",
        personalLinkedin: contact.personalLinkedin || "",
        status: contact.status || "NOT_CONTACTED",
        note: contact.note || "",
        lastContactedAt: formatDateForInput(contact.lastContactedAt),
        lastRepliedAt: formatDateForInput(contact.lastRepliedAt),
        nextFollowUpAt: formatDateForInput(contact.nextFollowUpAt),
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    setLoading(true);
    try {
      // Prepare data object for JSON request
      const dataToSend: Record<string, unknown> = {};

      // Only send fields that have changed from the original contact
      Object.entries(formData).forEach(([key, value]) => {
        // skip empty strings
        if (typeof value === "string" && value.trim() === "") return;

        const originalValue = contact[key as keyof Contact];
        const originalCountryId = contact.country?.id;

        // convert date inputs to ISO
        if (/(lastContactedAt|lastRepliedAt|nextFollowUpAt)/i.test(key)) {
          const dateVal = new Date(value as string);
          if (!isNaN(dateVal.getTime())) {
            // compare with original
            if (originalValue !== dateVal.toISOString()) {
              dataToSend[key] = dateVal.toISOString();
            }
          }
          return;
        }

        // Handle country field specially
        if (key === "country") {
          if (value !== originalCountryId) {
            dataToSend[key] = value;
          }
        }
        // For other fields, send if they've changed
        else if (value !== originalValue) {
          dataToSend[key] = value;
        }
      });

      console.log("Original contact:", contact);
      console.log("Form data:", formData);
      console.log("Data to send:", dataToSend);
      console.log("Session:", session);

      // Add modifiedById from current session
      if (session?.user?.id) {
        dataToSend.modifiedById = Number(session.user.id);
        console.log("Added modifiedById:", dataToSend.modifiedById);
      }

      // Ensure we have at least some data to update
      if (Object.keys(dataToSend).length === 0) {
        toast.error("No changes to update");
        setLoading(false);
        return;
      }

      console.log("Final data to send:", dataToSend);

      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/contact/${contact.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        },
      );

      if (res.ok) {
        toast.success("Lead updated successfully!");
        onSuccess();
        onClose();
      } else {
        let errorMessage = "Failed to update contact";
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            // If not JSON, try to get text response
            const textResponse = await res.text();
            console.error("Non-JSON error response:", textResponse);
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorMessage = `Failed to update contact (${res.status})`;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof ContactFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Contact
          </DialogTitle>
          <DialogDescription>
            Update the contact information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Company
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation" className="text-sm font-medium">
                Designation
              </Label>
              <Input
                id="designation"
                value={formData.designation || ""}
                onChange={(e) =>
                  handleInputChange("designation", e.target.value)
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-sm font-medium">
                Domain
              </Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => handleInputChange("domain", e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalLinkedin" className="text-sm font-medium">
                Personal LinkedIn
              </Label>
              <Input
                id="personalLinkedin"
                value={formData.personalLinkedin}
                onChange={(e) =>
                  handleInputChange("personalLinkedin", e.target.value)
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium">
              Country
            </Label>
            <Select
              value={formData.country ? formData.country.toString() : undefined}
              onValueChange={(value) =>
                handleInputChange("country", parseInt(value))
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries
                  .filter(
                    (country) =>
                      country.id && country.id.toString().trim() !== "",
                  )
                  .map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyLinkedin" className="text-sm font-medium">
                Company LinkedIn
              </Label>
              <Input
                id="companyLinkedin"
                value={formData.companyLinkedin}
                onChange={(e) =>
                  handleInputChange("companyLinkedin", e.target.value)
                }
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalLinkedin" className="text-sm font-medium">
                Personal LinkedIn
              </Label>
              <Input
                id="personalLinkedin"
                value={formData.personalLinkedin}
                onChange={(e) =>
                  handleInputChange("personalLinkedin", e.target.value)
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Status *
            </Label>
            <Select
              value={formData.status || "NOT_CONTACTED"}
              onValueChange={(value) =>
                handleInputChange("status", value as Contact["status"])
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select status">
                  {formData.status && formatStatus(formData.status)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOT_CONTACTED">
                  {formatStatus("NOT_CONTACTED")}
                </SelectItem>
                <SelectItem value="CONTACTED">
                  {formatStatus("CONTACTED")}
                </SelectItem>
                <SelectItem value="FOLLOW_UP_SENT">
                  {formatStatus("FOLLOW_UP_SENT")}
                </SelectItem>
                <SelectItem value="ENGAGED">
                  {formatStatus("ENGAGED")}
                </SelectItem>
                <SelectItem value="INTERESTED">
                  {formatStatus("INTERESTED")}
                </SelectItem>
                <SelectItem value="QUALIFIED">
                  {formatStatus("QUALIFIED")}
                </SelectItem>
                <SelectItem value="CATALOG_SENT">
                  {formatStatus("CATALOG_SENT")}
                </SelectItem>
                <SelectItem value="SAMPLE_REQUESTED">
                  {formatStatus("SAMPLE_REQUESTED")}
                </SelectItem>
                <SelectItem value="SAMPLE_SENT">
                  {formatStatus("SAMPLE_SENT")}
                </SelectItem>
                <SelectItem value="PRICE_NEGOTIATION">
                  {formatStatus("PRICE_NEGOTIATION")}
                </SelectItem>
                <SelectItem value="CLOSED_WON">
                  {formatStatus("CLOSED_WON")}
                </SelectItem>
                <SelectItem value="REPEAT_BUYER">
                  {formatStatus("REPEAT_BUYER")}
                </SelectItem>
                <SelectItem value="NON_RESPONSIVE">
                  {formatStatus("NON_RESPONSIVE")}
                </SelectItem>
                <SelectItem value="REENGAGED">
                  {formatStatus("REENGAGED")}
                </SelectItem>
                <SelectItem value="DORMANT">
                  {formatStatus("DORMANT")}
                </SelectItem>
                <SelectItem value="NOT_INTERESTED">
                  {formatStatus("NOT_INTERESTED")}
                </SelectItem>
                <SelectItem value="INVALID">
                  {formatStatus("INVALID")}
                </SelectItem>
                <SelectItem value="DO_NOT_CONTACT">
                  {formatStatus("DO_NOT_CONTACT")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* History Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="lastContactedAt" className="text-sm font-medium">
                Last Contacted
              </Label>
              <Input
                type="date"
                id="lastContactedAt"
                value={formData.lastContactedAt || ""}
                onChange={(e) =>
                  handleInputChange("lastContactedAt", e.target.value)
                }
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastRepliedAt" className="text-sm font-medium">
                Last Replied
              </Label>
              <Input
                type="date"
                id="lastRepliedAt"
                value={formData.lastRepliedAt || ""}
                onChange={(e) =>
                  handleInputChange("lastRepliedAt", e.target.value)
                }
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextFollowUpAt" className="text-sm font-medium">
                Next Follow-up
              </Label>
              <Input
                type="date"
                id="nextFollowUpAt"
                value={formData.nextFollowUpAt || ""}
                onChange={(e) =>
                  handleInputChange("nextFollowUpAt", e.target.value)
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              rows={3}
              className="resize-none"
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
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
