"use client";

import { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    domain: "",
    country: undefined,
    companyLinkedin: "",
    personalLinkedin: "",
    status: "NEW",
    note: "",
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/country`);
        if (res.ok) {
          const data = await res.json();
          const countriesArray = Array.isArray(data) ? data : data?.data || [];
          setCountries(countriesArray);
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      }
    };

    if (isOpen) {
      fetchCountries();
    }
  }, [isOpen]);

  // Populate form when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email,
        company: contact.company,
        domain: contact.domain || "",
        country: contact.country?.id,
        companyLinkedin: contact.companyLinkedin || "",
        personalLinkedin: contact.personalLinkedin || "",
        status: contact.status || "NEW",
        note: contact.note || "",
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
        const originalValue = contact[key as keyof Contact];
        const originalCountryId = contact.country?.id;

        // Handle country field specially
        if (key === "country") {
          if (value !== originalCountryId) {
            dataToSend[key] = value;
          }
        }
        // For other fields, send if they've changed (including empty strings)
        else if (value !== originalValue) {
          dataToSend[key] = value;
        }
      });

      console.log("Original contact:", contact);
      console.log("Form data:", formData);
      console.log("Data to send:", dataToSend);

      // Ensure we have at least some data to update
      if (Object.keys(dataToSend).length === 0) {
        toast.error("No changes to update");
        setLoading(false);
        return;
      }

      console.log("Updating contact with data:", dataToSend);

      const res = await fetch(
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
        toast.success("Contact updated successfully!");
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
              value={formData.status || "NEW"}
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
                <SelectItem value="NEW">{formatStatus("NEW")}</SelectItem>
                <SelectItem value="CONTACTED">
                  {formatStatus("CONTACTED")}
                </SelectItem>
                <SelectItem value="RESPONDED">
                  {formatStatus("RESPONDED")}
                </SelectItem>
                <SelectItem value="QUALIFIED">
                  {formatStatus("QUALIFIED")}
                </SelectItem>
                <SelectItem value="NEGOTIATING">
                  {formatStatus("NEGOTIATING")}
                </SelectItem>
                <SelectItem value="CLOSED_WON">
                  {formatStatus("CLOSED_WON")}
                </SelectItem>
                <SelectItem value="CLOSED_LOST">
                  {formatStatus("CLOSED_LOST")}
                </SelectItem>
              </SelectContent>
            </Select>
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
