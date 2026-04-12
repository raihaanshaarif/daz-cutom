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
  MessageSquare,
  User,
  UserRoundPlus,
  CheckCircle,
  Clock,
  Target,
  Trophy,
  XCircle,
  Briefcase,
  ChevronLeft,
  Calendar,
  Contact2,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Country } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

const statusConfig = {
  NOT_CONTACTED: {
    icon: UserRoundPlus,
    color: "bg-slate-500/10 text-slate-600 border-slate-200",
    label: "Not Contacted",
  },
  CONTACTED: {
    icon: Mail,
    color: "bg-yellow-500/10 text-yellow-600 border-yellow-200",
    label: "Contacted",
  },
  FOLLOW_UP_SENT: {
    icon: Clock,
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    label: "Follow-up Sent",
  },
  ENGAGED: {
    icon: MessageSquare,
    color: "bg-green-500/10 text-green-600 border-green-200",
    label: "Engaged",
  },
  INTERESTED: {
    icon: Target,
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
    label: "Interested",
  },
  QUALIFIED: {
    icon: Target,
    color: "bg-purple-500/10 text-purple-600 border-purple-200",
    label: "Qualified",
  },
  CATALOG_SENT: {
    icon: Globe,
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
    label: "Catalog Sent",
  },
  SAMPLE_REQUESTED: {
    icon: Briefcase,
    color: "bg-teal-500/10 text-teal-600 border-teal-200",
    label: "Sample Requested",
  },
  SAMPLE_SENT: {
    icon: Briefcase,
    color: "bg-teal-200 text-teal-900 border-teal-200",
    label: "Sample Sent",
  },
  PRICE_NEGOTIATION: {
    icon: Trophy,
    color: "bg-orange-500/10 text-orange-600 border-orange-200",
    label: "Price Negotiation",
  },
  CLOSED_WON: {
    icon: Trophy,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    label: "Closed Won",
  },
  REPEAT_BUYER: {
    icon: CheckCircle,
    color: "bg-green-200 text-green-900 border-green-200",
    label: "Repeat Buyer",
  },
  NON_RESPONSIVE: {
    icon: Clock,
    color: "bg-gray-500/10 text-gray-600 border-gray-200",
    label: "Non Responsive",
  },
  REENGAGED: {
    icon: CheckCircle,
    color: "bg-lime-500/10 text-lime-600 border-lime-200",
    label: "Re-engaged",
  },
  DORMANT: {
    icon: Clock,
    color: "bg-gray-200 text-gray-700 border-gray-200",
    label: "Dormant",
  },
  NOT_INTERESTED: {
    icon: XCircle,
    color: "bg-red-500/10 text-red-600 border-red-200",
    label: "Not Interested",
  },
  INVALID: {
    icon: XCircle,
    color: "bg-rose-500/10 text-rose-600 border-rose-200",
    label: "Invalid",
  },
  DO_NOT_CONTACT: {
    icon: XCircle,
    color: "bg-black text-white border-black",
    label: "Do Not Contact",
  },
};

export default function CreateContactForm() {
  const { authFetch } = useAuthFetch();
  const [selectedStatus, setSelectedStatus] = useState<string>("NOT_CONTACTED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const router = useRouter();

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        // console.log("NEXT_PUBLIC_BASE_API:", process.env.NEXT_PUBLIC_BASE_API);
        const apiUrl = `${process.env.NEXT_PUBLIC_BASE_API}/country`;
        // console.log("Fetching countries from:", apiUrl);

        const response = await authFetch(apiUrl);
        // console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          // console.log("Countries API response:", data);

          // Handle different response structures
          const countriesArray = data?.data || [];

          // console.log("Parsed countries array:", countriesArray);
          // console.log("Countries array length:", countriesArray.length);

          setCountries(countriesArray);
          // console.log("Countries state set successfully");
          // console.log("Setting countries to:", countriesArray);
        } else {
          console.error("Failed to fetch countries:", response.status);
          const errorText = await response.text();
          console.error("Error response:", errorText);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, [authFetch]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // console.log("Form Data entries:");
      // for (const [key, value] of formData.entries()) {
      //   console.log(`${key}:`, value);
      // }

      // console.log("Calling createContact...");
      const result = await createContact(formData);
      // console.log("createContact result:", result);

      if (result?.data?.id) {
        toast.success("Lead created successfully!", {
          description: "The new lead has been added to database.",
          duration: 4000,
        });
        // Navigate after a short delay to let the user see the toast
        setTimeout(() => {
          router.push("/dashboard/contact/my-contacts");
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
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <UserRoundPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Create New Lead
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Register a new prospect into your sales pipeline
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="h-10 px-4 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              form="contact-form"
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Lead"
              )}
            </Button>
          </div>
        </div>

        <form
          id="contact-form"
          action={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-7 gap-6"
        >
          {/* Main Info - Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Personal Details
                </h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="e.g. Alexander Hamilton"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="alexander@company.com"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="designation"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Professional Role
                  </Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="designation"
                      name="designation"
                      placeholder="e.g. Chief Procurement Officer"
                      className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Organization Info
                </h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="company"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      id="company"
                      name="company"
                      required
                      placeholder="Organization Name"
                      className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="domain"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Company Domain
                    </Label>
                    <div className="relative group">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="domain"
                        name="domain"
                        placeholder="company.com"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="countryId"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Primary Location
                    </Label>
                    <Select name="countryId">
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
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
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 bg-zinc-900 dark:bg-zinc-900">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <h2 className="font-semibold text-white">Lead Remarks</h2>
              </div>
              <CardContent className="p-0">
                <Textarea
                  id="note"
                  name="note"
                  placeholder="Internal notes about this contact, history, or specific requirements..."
                  className="min-h-[120px] bg-zinc-900 border-none text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all rounded-none resize-none p-6"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Target className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Status Control
                </h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Discovery Status
                    </Label>
                    <Select
                      name="status"
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                      required
                    >
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-purple-500/10 transition-all">
                        <SelectValue placeholder="Set lead status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([value, config]) => {
                          const Icon = config.icon;
                          return (
                            <SelectItem
                              key={value}
                              value={value}
                              className="py-2"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 opacity-50" />
                                <span className="text-sm">{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div
                    className={`p-4 rounded-xl border-l-4 transition-all duration-300 ${statusConfig[
                      selectedStatus as keyof typeof statusConfig
                    ]?.color
                      .split(" ")
                      .filter((c) => !c.includes("text") && !c.includes("bg"))
                      .join(
                        " ",
                      )} ${statusConfig[selectedStatus as keyof typeof statusConfig]?.color}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {React.createElement(
                          statusConfig[
                            selectedStatus as keyof typeof statusConfig
                          ]?.icon,
                          { className: "w-5 h-5" },
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold opacity-90">
                          {
                            statusConfig[
                              selectedStatus as keyof typeof statusConfig
                            ]?.label
                          }
                        </p>
                        <p className="text-[10px] uppercase tracking-tighter opacity-60 font-semibold mt-0.5">
                          Active Stage
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Linkedin className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Social Presence
                </h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="companyLinkedin"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Company LinkedIn
                  </Label>
                  <div className="relative group">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="companyLinkedin"
                      name="companyLinkedin"
                      placeholder="linkedin.com/company/..."
                      className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="personalLinkedin"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Personal Profile
                  </Label>
                  <div className="relative group">
                    <Contact2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      id="personalLinkedin"
                      name="personalLinkedin"
                      placeholder="linkedin.com/in/..."
                      className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  History Dates
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastContactedAt"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Last Contacted
                    </Label>
                    <Input
                      id="lastContactedAt"
                      name="lastContactedAt"
                      type="date"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastRepliedAt"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Last Replied
                    </Label>
                    <Input
                      id="lastRepliedAt"
                      name="lastRepliedAt"
                      type="date"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="nextFollowUpAt"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Next Follow-up
                    </Label>
                    <Input
                      id="nextFollowUpAt"
                      name="nextFollowUpAt"
                      type="date"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-900/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                      System Record
                    </p>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      Ready for Pipeline
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs text-emerald-600/80 leading-relaxed italic">
                  Completing this form will initialize contact tracking and
                  enable follow-up automation.
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
