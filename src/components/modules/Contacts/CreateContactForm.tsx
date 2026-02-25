"use client";
import { createContact } from "@/actions/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Building2,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  User,
  UserRoundPlus,
  CheckCircle,
  Clock,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Country } from "@/types";

const statusConfig = {
  NOT_SENT: {
    icon: UserRoundPlus,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    label: "Not Sent",
  },
  NEW: {
    icon: UserRoundPlus,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    label: "New Lead",
  },
  CONTACTED: {
    icon: Mail,
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    label: "Contacted",
  },
  RESPONDED: {
    icon: MessageSquare,
    color: "bg-green-500/10 text-green-600 border-green-200",
    label: "Responded",
  },
  QUALIFIED: {
    icon: Target,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    label: "Qualified",
  },
  NEGOTIATING: {
    icon: Clock,
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    label: "Negotiating",
  },
  CLOSED_WON: {
    icon: Trophy,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    label: "Closed Won",
  },
  CLOSED_LOST: {
    icon: XCircle,
    color: "bg-red-500/10 text-red-600 border-red-200",
    label: "Closed Lost",
  },
};

export default function CreateContactForm() {
  const [selectedStatus, setSelectedStatus] = useState<string>("NOT_SENT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const router = useRouter();

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/country`,
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Countries API response:", data);

          // Handle different response structures
          const countriesArray = Array.isArray(data)
            ? data
            : data.data || data.countries || [];
          setCountries(countriesArray);
        } else {
          console.error("Failed to fetch countries:", response.status);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Log form data values for debugging
      console.log("Form Data entries:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log("Calling createContact...");
      const result = await createContact(formData);
      console.log("createContact result:", result);

      if (result?.id) {
        toast.success("Contact created successfully!", {
          description: "The new contact has been added to your database.",
          duration: 4000,
        });
        // Navigate after a short delay to let the user see the toast
        setTimeout(() => {
          router.push("/dashboard/my-contacts");
        }, 1500);
      } else {
        toast.error("Failed to create contact", {
          description: "Please check your information and try again.",
        });
      }
    } catch {
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-2 shadow-md">
            <UserRoundPlus className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
            Create New Contact
          </h1>
          <p className="text-gray-500 text-xs">
            Add a new lead to your contact database
          </p>
        </div>

        <form
          action={handleSubmit}
          className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden"
        >
          <div className="p-4 lg:p-6">
            {/* Basic Information Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Basic Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Enter full name"
                    className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="contact@company.com"
                    className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Company Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company */}
                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Company Name *
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    required
                    placeholder="Company Inc."
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>

                {/* Domain */}
                <div className="space-y-2">
                  <Label
                    htmlFor="domain"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website Domain
                  </Label>
                  <Input
                    id="domain"
                    name="domain"
                    placeholder="company.com"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label
                    htmlFor="country"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Country
                  </Label>
                  <Select name="countryId">
                    <SelectTrigger className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(countries) &&
                        countries.map((country) => (
                          <SelectItem
                            key={country.id}
                            value={country.id.toString()}
                          >
                            {country.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md flex items-center justify-center">
                  <Linkedin className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Social Profiles
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company LinkedIn */}
                <div className="space-y-2">
                  <Label
                    htmlFor="companyLinkedin"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    Company LinkedIn
                  </Label>
                  <Input
                    id="companyLinkedin"
                    name="companyLinkedin"
                    placeholder="https://linkedin.com/company/example"
                    className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                {/* Personal LinkedIn */}
                <div className="space-y-2">
                  <Label
                    htmlFor="personalLinkedin"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    Personal LinkedIn
                  </Label>
                  <Input
                    id="personalLinkedin"
                    name="personalLinkedin"
                    placeholder="https://linkedin.com/in/john-doe"
                    className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Status & Notes Section */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-md flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Lead Status & Notes
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Status */}
                <div className="lg:col-span-1 space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Lead Status *
                  </Label>
                  <Select
                    name="status"
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                    required
                  >
                    <SelectTrigger className="h-8 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([value, config]) => {
                        const Icon = config.icon;
                        return (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  {/* Status Preview */}
                  {selectedStatus && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${statusConfig[selectedStatus as keyof typeof statusConfig]?.color}`}
                    >
                      {React.createElement(
                        statusConfig[
                          selectedStatus as keyof typeof statusConfig
                        ]?.icon,
                        { className: "w-3 h-3" },
                      )}
                      {
                        statusConfig[
                          selectedStatus as keyof typeof statusConfig
                        ]?.label
                      }
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="lg:col-span-2 space-y-2">
                  <Label
                    htmlFor="note"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Additional Notes
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    placeholder="Add any additional information about this contact..."
                    className="min-h-16 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Contact...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserRoundPlus className="w-5 h-5" />
                    Create Contact
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
