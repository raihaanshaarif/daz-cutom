"use client";
import { createCountry } from "@/actions/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, MapPin } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateCountryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const result = await createCountry(formData);

      if (result?.id) {
        toast.success("Country registered!", {
          description: "New geographical sector added to the platform.",
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/country/country-list");
        }, 1500);
      } else {
        toast.error("Execution failed", {
          description: "Validate the country code and try again.",
        });
      }
    } catch {
      toast.error("System error", {
        description: "An unexpected error occurred. Please retry later.",
      });
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
            <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Register Country
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Expand organizational reach by adding new regional sectors
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
              Cancel
            </Button>
            <Button
              form="country-form"
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Save Country"
              )}
            </Button>
          </div>
        </div>

        <form
          id="country-form"
          action={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-7 gap-6"
        >
          {/* Main Info - Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <MapPin className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Geopolitical Data
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Country name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="e.g. United Kingdom"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="code"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      ISO Alpha-2 Code
                    </Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="code"
                        name="code"
                        placeholder="e.g. UK, BD, US"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-900 p-6 shadow-sm">
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-emerald-400">
                <Globe className="h-4 w-4" />
                Regional Standards
              </h4>
              <div className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                  &ldquo;Registering regional sectors enables localized currency
                  handling, shipping calculation, and regional tax
                  compliance.&rdquo;
                </p>
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 font-mono tracking-tighter">
                  <span>ISO_SYNC: ACTIVE</span>
                  <span>SECURED</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center justify-center text-center space-y-3 bg-zinc-50/30 dark:bg-zinc-900/10">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Localized Routing
              </h5>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                New countries will be immediately available in shipment and
                order fulfillment forms across the platform.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
