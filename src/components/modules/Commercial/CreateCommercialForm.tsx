"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Calendar,
  DollarSign,
  ClipboardList,
  ShoppingBag,
  Search,
  X,
  Truck,
  ArrowLeft,
  BadgeDollarSign,
  Info,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Order } from "@/types";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

const documentStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PREPARING", label: "Preparing" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "REJECTED", label: "Rejected" },
  { value: "REVISED", label: "Revised" },
  { value: "APPROVED", label: "Approved" },
  { value: "COMPLETED", label: "Completed" },
];

const paymentStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "SURRENDERED", label: "Surrendered" },
];

export default function CreateCommercialForm() {
  const { authFetch } = useAuthFetch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentStatus, setDocumentStatus] = useState("PENDING");
  const [paymentStatus, setPaymentStatus] = useState("PENDING");

  // Order search state
  const [orderSearch, setOrderSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchOrders = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }
      setIsSearching(true);
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/order/orders?search=${encodeURIComponent(query)}&limit=20`,
        );
        if (res.ok) {
          const json = await res.json();
          const arr: Order[] = json?.data || [];
          setSearchResults(arr);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Failed to search orders:", err);
      } finally {
        setIsSearching(false);
      }
    },
    [authFetch],
  );

  const handleOrderSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOrderSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchOrders(val), 300);
  };

  const addOrder = (order: Order) => {
    if (!selectedOrders.find((o) => o.id === order.id)) {
      setSelectedOrders((prev) => [...prev, order]);
    }
    setOrderSearch("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const removeOrder = (id: number) => {
    setSelectedOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const selectedOrderIds = selectedOrders.map((o) => o.id);

  const toIso = (val: string) =>
    val ? new Date(val).toISOString() : undefined;

  const toFloat = (val: string) => {
    const n = parseFloat(val);
    return isNaN(n) ? undefined : n;
  };

  const toInt = (val: string) => {
    const n = parseInt(val);
    return isNaN(n) ? undefined : n;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const get = (key: string) => fd.get(key) as string;

    const payload = {
      bookingReference: get("bookingReference") || undefined,
      invoiceNo: get("invoiceNo") || undefined,
      quantity: toInt(get("quantity")),
      totalPrice: toFloat(get("totalPrice")),
      bookingDate: toIso(get("bookingDate")),
      bookingHandoverDate: toIso(get("bookingHandoverDate")),
      handoverDate: toIso(get("handoverDate")) || undefined,
      etd: toIso(get("etd")) || undefined,
      eta: toIso(get("eta")) || undefined,
      lacAmount: toFloat(get("lacAmount")),
      documentStatus,
      docCourierNo: get("docCourierNo") || undefined,
      approximatePaymentDate: toIso(get("approximatePaymentDate")) || undefined,
      paymentStatus,
      receivedAmount: toFloat(get("receivedAmount")),
      receivedDate: toIso(get("receivedDate")) || undefined,
      balance: toFloat(get("balance")),
      remarks: get("remarks") || undefined,
      orderIds: selectedOrderIds.length > 0 ? selectedOrderIds : undefined,
    };

    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/commercial`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await res.json();

      if (res.ok && result?.data?.id) {
        toast.success("Commercial created successfully!");
        setTimeout(() => {
          router.push("/dashboard/commercial/invoice-list");
        }, 1500);
      } else {
        toast.error("Failed to create commercial", {
          description: result?.message || "Please check your information.",
        });
      }
    } catch {
      toast.error("An error occurred. Please try again later.");
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Create Commercial
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your commercial invoices and shipping documents
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
              form="commercial-form"
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 text-sm font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Create Record"
              )}
            </Button>
          </div>
        </div>

        <form
          id="commercial-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-7 gap-6"
        >
          {/* Main Info - Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Shipment Details
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bookingReference"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Booking Reference
                    </Label>
                    <Input
                      id="bookingReference"
                      name="bookingReference"
                      placeholder="BK-2026-001"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="invoiceNo"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Invoice Number
                    </Label>
                    <Input
                      id="invoiceNo"
                      name="invoiceNo"
                      placeholder="INV-2026-001"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="bookingDate"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Booking Date
                    </Label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        type="date"
                        id="bookingDate"
                        name="bookingDate"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="bookingHandoverDate"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Booking Handover Date
                    </Label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                      <Input
                        type="date"
                        id="bookingHandoverDate"
                        name="bookingHandoverDate"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <BadgeDollarSign className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Financial Information
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="quantity"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      placeholder="0"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label
                      htmlFor="totalPrice"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Total Price
                    </Label>
                    <div className="relative group">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="totalPrice"
                        name="totalPrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-2">
                    <Label
                      htmlFor="receivedAmount"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Received Amount
                    </Label>
                    <div className="relative group">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                      <Input
                        id="receivedAmount"
                        name="receivedAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="balance"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Outstanding Balance
                    </Label>
                    <div className="relative group">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
                      <Input
                        id="balance"
                        name="balance"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Linked Orders
                </h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div ref={searchRef} className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    value={orderSearch}
                    onChange={handleOrderSearchChange}
                    onFocus={() =>
                      searchResults.length > 0 && setShowDropdown(true)
                    }
                    placeholder="Search order number..."
                    className="pl-10 h-11 bg-zinc-50/50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  )}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-popover-foreground shadow-xl">
                      {searchResults.map((order) => {
                        const isSelected = selectedOrders.some(
                          (o) => o.id === order.id,
                        );
                        return (
                          <div
                            key={order.id}
                            onClick={() => !isSelected && addOrder(order)}
                            className={cn(
                              "flex items-center justify-between p-4 text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b last:border-0 border-zinc-100 dark:border-zinc-800",
                              isSelected &&
                                "pointer-events-none opacity-50 bg-zinc-50 dark:bg-zinc-800/50",
                            )}
                          >
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {order.orderNumber}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {order.buyer?.name} • {order.style}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-sm">
                                Linked
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-3 py-1.5 text-xs font-medium text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/60"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      {order.orderNumber}
                      <button
                        type="button"
                        onClick={() => removeOrder(order.id)}
                        className="rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {selectedOrders.length === 0 && (
                    <div className="flex h-24 w-full items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 bg-zinc-50/30 dark:bg-zinc-900/10">
                      No orders linked to this commercial record
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-sm">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Status & Logistics
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Document Status
                    </Label>
                    <Select
                      value={documentStatus}
                      onValueChange={setDocumentStatus}
                    >
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Payment Status
                    </Label>
                    <Select
                      value={paymentStatus}
                      onValueChange={setPaymentStatus}
                    >
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      ETD
                    </Label>
                    <Input
                      type="date"
                      id="etd"
                      name="etd"
                      className="h-10 text-xs bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      ETA
                    </Label>
                    <Input
                      type="date"
                      id="eta"
                      name="eta"
                      className="h-10 text-xs bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label
                    htmlFor="docCourierNo"
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Tracking Number
                  </Label>
                  <Input
                    id="docCourierNo"
                    name="docCourierNo"
                    placeholder="Enter tracking ID"
                    className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="bg-zinc-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Info className="h-12 w-12 text-zinc-100" />
              </div>
              <h4 className="font-bold flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                Internal Remarks
              </h4>
              <Textarea
                id="remarks"
                name="remarks"
                placeholder="Internal notes or special instructions..."
                className="min-h-[120px] bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:ring-indigo-500/20 text-sm leading-relaxed"
              />
              <div className="pt-4 mt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                <span>Auto-sync active</span>
                <span>DATA_NODE_SECURED</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
