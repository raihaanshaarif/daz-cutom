"use client";
import { createCourier } from "@/actions/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Truck,
  ArrowLeft,
  MapPin,
  Phone,
  Building2,
  CheckCircle2,
  PackageSearch,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateCourierForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await createCourier(formData);
      if (result?.data.id) {
        toast.success("Courier created successfully!", {
          description: "The new courier company has been added to your list.",
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/courier");
        }, 1500);
      } else {
        toast.error("Failed to create courier");
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
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Register Courier
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Establish a new logistics partnership for global shipments
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() =>
                (
                  document.querySelector("form") as HTMLFormElement
                )?.requestSubmit()
              }
              disabled={isSubmitting}
              className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 text-sm font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Save Partner"
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
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Company Information
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Partner Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="e.g. Global Express"
                        className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contactNumber"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Contact Hotline <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        required
                        placeholder="+880 1XXX-XXXXXX"
                        className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Operations HQ <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                      <textarea
                        id="address"
                        name="address"
                        required
                        rows={3}
                        placeholder="Enter full office address..."
                        className="w-full pl-10 pt-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-orange-500/20 rounded-xl transition-all outline-none text-sm min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <h4 className="font-bold flex items-center gap-2 mb-4 text-zinc-900 dark:text-zinc-100">
                <Zap className="h-4 w-4 text-indigo-500 fill-indigo-500" />
                Quick Highlights
              </h4>
              <div className="space-y-4">
                <div className="flex gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <PackageSearch className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Tracking API
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      Real-time parcel monitoring for integrated shipments
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Truck className="h-12 w-12" />
              </div>
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                Logistics Protocol
              </h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                New partners are registered with &ldquo;Pending&rdquo; status.
                Verify their API credentials before assigning high-volume
                parcels.
              </p>
              <div className="text-[11px] text-indigo-400/80 font-mono tracking-tighter bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 flex justify-between items-center">
                <span>STATUS_CODE: LG_REG_01</span>
                <span>v2.2</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
