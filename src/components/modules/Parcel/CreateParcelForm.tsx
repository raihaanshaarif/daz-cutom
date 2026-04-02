"use client";
import { createParcel } from "@/actions/create";
import { Buyer, Courier } from "@/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  Truck,
  UserRoundPlus,
  ArrowLeft,
  Calendar,
  Layers,
  FileText,
  BadgeInfo,
  ChevronRight,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

export default function CreateParcelForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const { authFetch } = useAuthFetch();

  // Fetch buyers
  useEffect(() => {
    if (!userId || !session?.user?.role) return; // Wait for session to load
    const fetchBuyers = async () => {
      setLoadingBuyers(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
        });
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/order/buyers?${params}`,
          {
            cache: "no-store",
          },
        );
        const result = await res.json();
        console.log("Fetched buyers:", result);
        const buyerData = Array.isArray(result) ? result : result.data || [];
        setBuyers(buyerData);
      } catch (error) {
        console.error("Failed to fetch buyers:", error);
      } finally {
        setLoadingBuyers(false);
      }
    };

    fetchBuyers();
  }, [userId, session?.user?.role, authFetch]);

  // Fetch couriers
  useEffect(() => {
    if (!userId || !session?.user?.role) return; // Wait for session to load
    const fetchCouriers = async () => {
      setLoadingCouriers(true);
      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
        });
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies?${params}`,
          {
            cache: "no-store",
          },
        );
        const result = await res.json();
        console.log("Fetched couriers:", result);
        const courierData = Array.isArray(result) ? result : result.data || [];
        setCouriers(courierData);
      } catch (error) {
        console.error("Failed to fetch couriers:", error);
      } finally {
        setLoadingCouriers(false);
      }
    };

    fetchCouriers();
  }, [userId, session?.user?.role, authFetch]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Add createdById from session
      formData.append("createdById", userId);

      const result = await createParcel(formData);
      console.log("createParcel result:", result);

      if (result?.data?.id || result?.id) {
        toast.success("Parcel created successfully!", {
          description: "The new parcel has been added to your list.",
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/parcel");
        }, 1500);
      } else {
        toast.error("Failed to create parcel", {
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
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Modern Header Section */}
        <div className="sticky top-0 z-30 flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200/50 gap-4 pt-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Parcel <span className="text-indigo-600">Shipment</span>
            </h1>
            <p className="text-zinc-500 mt-1 flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Register a new incoming or outgoing package for logistics
              tracking.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/50 p-1.5 rounded-2xl border border-zinc-200/50 shadow-sm">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="h-10 px-4 gap-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold text-sm">Cancel</span>
            </Button>
            <Button
              form="parcel-form"
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-8 bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-bold shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-indigo-500/50 rounded-xl gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  <span>Register Parcel</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <form id="parcel-form" action={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
            {/* Left Column: Logistics & Content (4 units) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Logistics Identification */}
              <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 transform transition-transform group-hover:scale-y-110" />
                <CardHeader className="border-b border-zinc-100/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-zinc-900">
                        Logistics Identification
                      </CardTitle>
                      <p className="text-xs text-zinc-500 font-medium">
                        Core identifier and tracking information
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-zinc-900">
                    <div className="space-y-3">
                      <Label className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />{" "}
                        Tracking Number
                      </Label>
                      <div className="relative group/input">
                        <Input
                          name="trackingNumber"
                          required
                          placeholder="EX: TRACK-123456"
                          className="pl-11 h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all rounded-2xl font-medium placeholder:text-zinc-300 group-hover/input:bg-white"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/input:text-indigo-500 transition-colors">
                          <Package className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />{" "}
                        Parcel Weight
                      </Label>
                      <div className="relative group/input">
                        <Input
                          name="weight"
                          type="number"
                          required
                          placeholder="0.00"
                          className="pr-16 h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all rounded-2xl font-mono font-bold group-hover/input:bg-white"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-zinc-100 rounded-lg text-zinc-500 font-mono text-[10px] font-black pointer-events-none">
                          GRAMS
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Description */}
              <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 transform transition-transform group-hover:scale-y-110" />
                <CardHeader className="border-b border-zinc-100/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-zinc-900">
                        Content Description
                      </CardTitle>
                      <p className="text-xs text-zinc-500 font-medium">
                        Details about the items inside the parcel
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 text-zinc-900">
                  <div className="space-y-3 font-medium">
                    <Label className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black flex items-center gap-2">
                      <BadgeInfo className="w-3.5 h-3.5 text-emerald-500" />{" "}
                      Description & Handling
                    </Label>
                    <Textarea
                      name="description"
                      required
                      placeholder="Detail the contents, fragility, or specific handling instructions..."
                      className="min-h-[160px] bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all resize-none p-5 rounded-2xl font-medium placeholder:text-zinc-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Parties & Sidebar (3 units) */}
            <div className="lg:col-span-3 space-y-8">
              {/* Parties Involved */}
              <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 transform transition-transform group-hover:scale-y-110" />
                <CardHeader className="border-b border-zinc-100/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                      <UserRoundPlus className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg font-bold text-zinc-900">
                      Parties Involved
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-8">
                  <div className="space-y-3 font-medium">
                    <Label className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black">
                      Target Buyer
                    </Label>
                    <Select name="buyerId" required>
                      <SelectTrigger className="h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all rounded-2xl font-semibold text-zinc-900">
                        <SelectValue placeholder="Select a buyer" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-zinc-200 shadow-xl">
                        {loadingBuyers ? (
                          <div className="p-4 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-zinc-200 border-t-blue-600 rounded-full animate-spin" />
                          </div>
                        ) : buyers.length > 0 ? (
                          buyers.map((buyer) => (
                            <SelectItem
                              key={buyer.id}
                              value={buyer.id.toString()}
                              className="focus:bg-blue-50 rounded-xl my-1 mx-1 transition-colors"
                            >
                              <div className="flex flex-col py-1">
                                <span className="font-bold text-sm text-zinc-900">
                                  {buyer.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                                  {buyer.brand}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-zinc-400 font-bold uppercase tracking-widest">
                            No buyers found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 font-medium">
                    <Label className="text-[11px] uppercase tracking-[0.1em] text-zinc-400 font-black">
                      Courier Partner
                    </Label>
                    <Select name="courierCompanyId" required>
                      <SelectTrigger className="h-13 bg-zinc-50/50 border-zinc-200/80 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all rounded-2xl font-semibold text-zinc-900">
                        <SelectValue placeholder="Select courier" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-zinc-200 shadow-xl">
                        {loadingCouriers ? (
                          <div className="p-4 flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-zinc-200 border-t-indigo-600 rounded-full animate-spin" />
                          </div>
                        ) : couriers.length > 0 ? (
                          couriers.map((courier) => (
                            <SelectItem
                              key={courier.id}
                              value={courier.id.toString()}
                              className="focus:bg-indigo-50 rounded-xl my-1 mx-1 transition-colors"
                            >
                              <span className="font-bold text-sm text-zinc-900">
                                {courier.name}
                              </span>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-zinc-400 font-bold uppercase tracking-widest">
                            No couriers available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Informational Block */}
              <div className="relative overflow-hidden p-6 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-50 shadow-2xl border border-white/5 group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-3xl" />

                <div className="relative flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                    <BadgeInfo className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight">
                      Instructions
                    </h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                      Validation Checkpoints
                    </p>
                  </div>
                </div>

                <ul className="relative space-y-4">
                  {[
                    {
                      label: "Identity",
                      text: "Double check the tracking number for carrier integration.",
                      color: "bg-indigo-500",
                    },
                    {
                      label: "Billing",
                      text: "Weight determines the shipping cost tier.",
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Target",
                      text: "Ensure the correct official buyer is linked.",
                      color: "bg-blue-500",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                      <div
                        className={`mt-1.5 w-1.5 h-1.5 rounded-full ${item.color} shadow-[0_0_8px_rgba(0,0,0,0.5)] shrink-0`}
                      />
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-black tracking-tighter text-zinc-500">
                          {item.label}
                        </span>
                        <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
