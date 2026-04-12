"use client";
import { createBuyer } from "@/actions/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingBag,
  UserRoundPlus,
  ArrowLeft,
  Store,
  Tag,
  Info,
  ChevronRight,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateBuyerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await createBuyer(formData);
      if (result?.data?.id) {
        toast.success("Buyer created successfully!", {
          description: "The new buyer has been added to your list.",
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/buyer/buyer-list");
        }, 1500);
      } else {
        toast.error("Failed to create buyer");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <UserRoundPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Add New Buyer
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Register a new business entity to your trade network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              asChild
              className="h-10 px-4 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Link href="/dashboard/buyer/buyer-list">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              onClick={() =>
                (
                  document.querySelector("form") as HTMLFormElement
                )?.requestSubmit()
              }
              disabled={isSubmitting}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all font-semibold active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Save Buyer"
              )}
            </Button>
          </div>
        </div>

        <form
          action={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-7 gap-6"
        >
          {/* Main Info - Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <Store className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Commercial Identity
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Buyer Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Buyer Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="e.g. Acme Corporation"
                        className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  {/* Brand */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="brand"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Trade Brand <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="brand"
                        name="brand"
                        required
                        placeholder="e.g. Acme Lifestyle"
                        className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4 text-sm leading-relaxed">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Creation Guidelines
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Ensure the buyer name matches their legal business
                    registration. Use the trade brand field if the public name
                    differs from the legal entity.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900 h-fit">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Quick Start
                </h2>
                <p className="text-xs text-zinc-500">
                  Step-by-step onboarding process
                </p>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      title: "Define Commercials",
                      desc: "Identity & Branding",
                      active: true,
                    },
                    {
                      title: "Assign Users",
                      desc: "Access Control",
                      active: false,
                    },
                    {
                      title: "Configure Terms",
                      desc: "Payment & Logistics",
                      active: false,
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4 relative">
                      {i < 2 && (
                        <div className="absolute left-[15px] top-8 w-[px] h-6 bg-zinc-100 dark:bg-zinc-800" />
                      )}
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all shrink-0 ${
                          step.active
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400 font-normal"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h5
                          className={`text-sm font-semibold transition-colors ${step.active ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400"}`}
                        >
                          {step.title}
                        </h5>
                        <p className="text-[10px] text-zinc-500 leading-none">
                          {step.desc}
                        </p>
                      </div>
                      {step.active && (
                        <ChevronRight className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-zinc-900 dark:bg-zinc-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Store className="h-12 w-12" />
              </div>
              <h4 className="font-bold flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Internal Note
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                New buyers are automatically assigned to the default regional
                workspace. Access status can be modified in the Buyer Settings.
              </p>
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                <span>SYSTEM_TIP</span>
                <span>v3.0</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
