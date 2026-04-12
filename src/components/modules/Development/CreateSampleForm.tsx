"use client";
import { createDevelopmentSample } from "@/actions/create";
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
import { Card, CardContent } from "@/components/ui/card";
import { Package, ChevronLeft, Tag, Info, CheckCircle2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Buyer, Factory } from "@/types";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

export default function CreateSampleForm() {
  const { authFetch } = useAuthFetch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [selectedFactoryId, setSelectedFactoryId] = useState("");
  const [selectedSeasonName, setSelectedSeasonName] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [buyersResponse, factoriesResponse] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`),
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/factories`),
        ]);

        const buyersData = await buyersResponse.json();
        const factoriesData = await factoriesResponse.json();

        setBuyers(buyersData?.data || []);
        setFactories(factoriesData?.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [authFetch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("buyerId", selectedBuyerId);
      formData.set("factoryId", selectedFactoryId);
      formData.set("seasonName", selectedSeasonName);

      const result = await createDevelopmentSample(formData);

      if (result?.data?.id) {
        toast.success("Sample created successfully!", {
          description: `Sample for style ${result.data.style} has been created.`,
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/development");
        }, 1500);
      } else {
        toast.error("Failed to create sample", {
          description:
            result?.message || "Please check your information and try again.",
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
            <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                New Development Sample
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Register a new development sample tracking entry
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
              form="development-form"
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create Sample"
              )}
            </Button>
          </div>
        </div>

        <form
          id="development-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-7 gap-6"
        >
          {/* Main Info - Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  <Tag className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Sample Information
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Buyer <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={setSelectedBuyerId}
                      value={selectedBuyerId}
                      required
                    >
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all">
                        <SelectValue placeholder="Select Buyer" />
                      </SelectTrigger>
                      <SelectContent>
                        {buyers.map((buyer) => (
                          <SelectItem
                            key={buyer.id}
                            value={buyer.id.toString()}
                          >
                            {buyer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Factory <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={setSelectedFactoryId}
                      value={selectedFactoryId}
                      required
                    >
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all">
                        <SelectValue placeholder="Select Factory" />
                      </SelectTrigger>
                      <SelectContent>
                        {factories.map((factory) => (
                          <SelectItem
                            key={factory.id}
                            value={factory.id.toString()}
                          >
                            {factory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Style Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="style"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Style <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="style"
                      name="style"
                      required
                      placeholder="e.g. DZ-2024-KM"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="styleName"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Style Name
                    </Label>
                    <Input
                      id="styleName"
                      name="styleName"
                      placeholder="e.g. Classic Polo Shirt"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Seasonal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Season Name <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      onValueChange={setSelectedSeasonName}
                      value={selectedSeasonName}
                      required
                    >
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all">
                        <SelectValue placeholder="Select Season" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SPRING">Spring</SelectItem>
                        <SelectItem value="SUMMER">Summer</SelectItem>
                        <SelectItem value="AUTUMN">Autumn</SelectItem>
                        <SelectItem value="WINTER">Winter</SelectItem>
                        <SelectItem value="PRE_FALL">Pre-Fall</SelectItem>
                        <SelectItem value="RESORT">Resort</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="year"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Season Year <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      required
                      placeholder="e.g. 2026"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="brand"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Brand
                    </Label>
                    <Input
                      id="brand"
                      name="brand"
                      placeholder="e.g. Nike, Adidas"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="color"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Color
                    </Label>
                    <Input
                      id="color"
                      name="color"
                      placeholder="e.g. Navy / White"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="sizes"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Sizes
                  </Label>
                  <Input
                    id="sizes"
                    name="sizes"
                    placeholder="e.g. S, M, L, XL"
                    className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Detailed description of the sample..."
                    className="min-h-[80px] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="composition"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    Composition
                  </Label>
                  <Textarea
                    id="composition"
                    name="composition"
                    placeholder="e.g. 100% Cotton"
                    className="min-h-[80px] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="userRemarks"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                  >
                    User Remarks
                  </Label>
                  <Textarea
                    id="userRemarks"
                    name="userRemarks"
                    placeholder="Additional notes about fabric, fit, or construction..."
                    className="min-h-[100px] bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-zinc-900 h-fit">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Quick Start
                </h2>
                <p className="text-xs text-zinc-500">
                  Step-by-step sample creation process
                </p>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      title: "Define Basics",
                      desc: "Style, buyer & factory details",
                      icon: "Tag",
                      completed: true,
                    },
                    {
                      title: "Product Details",
                      desc: "Season, color, fabric & sizing",
                      icon: "Package",
                      completed: true,
                    },
                    {
                      title: "Quality Standards",
                      desc: "Fabric quality & composition",
                      icon: "CheckCircle2",
                      completed: true,
                    },
                    {
                      title: "Tracking Setup",
                      desc: "Deadlines & milestones",
                      icon: "Calendar",
                      completed: false,
                    },
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-colors ${
                          step.completed
                            ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                          {step.title}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4 text-sm leading-relaxed">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Sample Creation Guidelines
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    Ensure all required fields are completed. Style numbers
                    should be unique and follow your brand&apos;s naming
                    convention. Track all quality parameters for successful
                    production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
