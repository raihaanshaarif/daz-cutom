"use client";
import { createFactory } from "@/actions/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Factory,
  ArrowLeft,
  Building2,
  Info,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateFactoryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await createFactory(formData);
      if (result?.id) {
        toast.success("Factory created successfully!", {
          description: "The new factory has been added to your list.",
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/factory/factory-list");
        }, 1500);
      } else {
        toast.error("Failed to create factory");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Add New Factory
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Onboard a new manufacturing partner to the system
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
              className="h-10 px-6 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95 text-sm font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Save Factory"
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
                <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Factory Identity
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Legal Factory Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Factory className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="e.g. Skyline Garments Ltd."
                        className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-orange-500/20 rounded-xl transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                        Data Synchronization
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed">
                        Once registered, this factory will be available for
                        order assignment across all commercial departments.
                        Ensure the name matches the trade license.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Security & Compliance
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[13px] text-zinc-600 dark:text-zinc-400">
                    Automated Audit Trail
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[13px] text-zinc-600 dark:text-zinc-400">
                    Global Search Indexed
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-[13px] text-zinc-600 dark:text-zinc-400">
                    Pending Identity Proof
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h4 className="font-bold mb-2">Onboarding Roadmap</h4>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                After registration, you will need to upload compliance
                certificates and bank details to enable financial processing.
              </p>
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-orange-500 rounded-full" />
                </div>
                <p className="text-[10px] text-zinc-500 flex justify-between uppercase font-bold tracking-tighter">
                  <span>Profile Progress</span>
                  <span>33% Initialized</span>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
