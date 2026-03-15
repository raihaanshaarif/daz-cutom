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
import {
  FileText,
  Package,
  Calendar,
  DollarSign,
  ClipboardList,
  Send,
  ShoppingBag,
  Search,
  X,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Order } from "@/types";

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
];

export default function CreateCommercialForm() {
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

  const searchOrders = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/order/orders?search=${encodeURIComponent(query)}&limit=20`,
      );
      if (res.ok) {
        const json = await res.json();
        const arr: Order[] = Array.isArray(json)
          ? json
          : json.data || json.orders || [];
        setSearchResults(arr);
        setShowDropdown(true);
      }
    } catch (err) {
      console.error("Failed to search orders:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/commercial`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const result = await res.json();

      if (res.ok && result?.id) {
        toast.success("Commercial created successfully!", {
          description: "The new commercial record has been saved.",
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/commercial/invoice-list");
        }, 1500);
      } else {
        toast.error("Failed to create commercial", {
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
    <div className="min-h-screen bg-background py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg mb-2 shadow-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
            Create Commercial
          </h1>
          <p className="text-gray-500 text-xs">
            Add a new commercial / invoice record
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden"
        >
          <div className="p-4 lg:p-6 space-y-4">
            {/* Reference & Invoice */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-md flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Reference & Invoice
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="bookingReference"
                    className="text-xs font-medium text-gray-700"
                  >
                    Booking Reference
                  </Label>
                  <Input
                    id="bookingReference"
                    name="bookingReference"
                    placeholder="e.g.: BK-2026-001"
                    className="h-8 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="invoiceNo"
                    className="text-xs font-medium text-gray-700"
                  >
                    Invoice No
                  </Label>
                  <Input
                    id="invoiceNo"
                    name="invoiceNo"
                    placeholder="e.g.: INV-2026-001"
                    className="h-8 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Orders */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                  <ShoppingBag className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Link Orders
                </h2>
              </div>

              {/* Selected order tags */}
              {selectedOrders.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedOrders.map((order) => (
                    <span
                      key={order.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {order.orderNumber}
                      <button
                        type="button"
                        onClick={() => removeOrder(order.id)}
                        className="ml-0.5 hover:text-blue-600 focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input with dropdown */}
              <div ref={searchRef} className="relative">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <Input
                    value={orderSearch}
                    onChange={handleOrderSearchChange}
                    onFocus={() =>
                      searchResults.length > 0 && setShowDropdown(true)
                    }
                    placeholder="e.g.: ORD-2026-001"
                    className="h-8 pl-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  {isSearching && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                  )}
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                    {searchResults.map((order) => {
                      const already = selectedOrders.some(
                        (o) => o.id === order.id,
                      );
                      return (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => !already && addOrder(order)}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center justify-between ${
                            already
                              ? "opacity-40 cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                        >
                          <span className="font-medium text-gray-800">
                            {order.orderNumber}
                          </span>
                          <span className="text-gray-400 ml-2 truncate max-w-[60%]">
                            {[order.buyer?.name, order.style, order.color]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {showDropdown &&
                  !isSearching &&
                  orderSearch &&
                  searchResults.length === 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs text-gray-400">
                      No orders found
                    </div>
                  )}
              </div>

              {selectedOrders.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {selectedOrders.length} order
                  {selectedOrders.length > 1 ? "s" : ""} linked
                </p>
              )}
            </div>

            {/* Quantity & Pricing */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-md flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Quantity & Pricing
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="quantity"
                    className="text-xs font-medium text-gray-700"
                  >
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    placeholder="e.g.: 12000"
                    className="h-8 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="totalPrice"
                    className="text-xs font-medium text-gray-700"
                  >
                    Total Price ($)
                  </Label>
                  <Input
                    id="totalPrice"
                    name="totalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g.: 85000"
                    className="h-8 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lacAmount"
                    className="text-xs font-medium text-gray-700"
                  >
                    LAC Amount ($)
                  </Label>
                  <Input
                    id="lacAmount"
                    name="lacAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g.: 40000"
                    className="h-8 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-md flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">Dates</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="bookingDate"
                    className="text-xs font-medium text-gray-700"
                  >
                    Booking Date *
                  </Label>
                  <Input
                    id="bookingDate"
                    name="bookingDate"
                    type="date"
                    required
                    className="h-8 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="bookingHandoverDate"
                    className="text-xs font-medium text-gray-700"
                  >
                    Booking Handover Date *
                  </Label>
                  <Input
                    id="bookingHandoverDate"
                    name="bookingHandoverDate"
                    type="date"
                    required
                    className="h-8 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="handoverDate"
                    className="text-xs font-medium text-gray-700"
                  >
                    Handover Date
                  </Label>
                  <Input
                    id="handoverDate"
                    name="handoverDate"
                    type="date"
                    className="h-8 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="etd"
                    className="text-xs font-medium text-gray-700"
                  >
                    ETD
                  </Label>
                  <Input
                    id="etd"
                    name="etd"
                    type="date"
                    className="h-8 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="eta"
                    className="text-xs font-medium text-gray-700"
                  >
                    ETA
                  </Label>
                  <Input
                    id="eta"
                    name="eta"
                    type="date"
                    className="h-8 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Document Status */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-md flex items-center justify-center">
                  <ClipboardList className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Document Status
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    Document Status
                  </Label>
                  <Select
                    value={documentStatus}
                    onValueChange={setDocumentStatus}
                  >
                    <SelectTrigger className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
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
                  <Label
                    htmlFor="docCourierNo"
                    className="text-xs font-medium text-gray-700"
                  >
                    Doc Courier No
                  </Label>
                  <Input
                    id="docCourierNo"
                    name="docCourierNo"
                    placeholder="e.g.: DHL-784512"
                    className="h-8 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">Payment</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="lacAmountPayment"
                    className="text-xs font-medium text-gray-700"
                  >
                    LAC Value ($)
                  </Label>
                  <Input
                    id="lacAmountPayment"
                    name="lacAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g.: 40000"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-gray-700">
                    Payment Status
                  </Label>
                  <Select
                    value={paymentStatus}
                    onValueChange={setPaymentStatus}
                  >
                    <SelectTrigger className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20">
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
                <div className="space-y-2">
                  <Label
                    htmlFor="approximatePaymentDate"
                    className="text-xs font-medium text-gray-700"
                  >
                    Approximate Payment Date
                  </Label>
                  <Input
                    id="approximatePaymentDate"
                    name="approximatePaymentDate"
                    type="date"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="receivedAmount"
                    className="text-xs font-medium text-gray-700"
                  >
                    Received Amount ($)
                  </Label>
                  <Input
                    id="receivedAmount"
                    name="receivedAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g.: 20000"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="receivedDate"
                    className="text-xs font-medium text-gray-700"
                  >
                    Received Date
                  </Label>
                  <Input
                    id="receivedDate"
                    name="receivedDate"
                    type="date"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="balance"
                    className="text-xs font-medium text-gray-700"
                  >
                    Balance ($)
                  </Label>
                  <Input
                    id="balance"
                    name="balance"
                    type="number"
                    step="0.01"
                    placeholder="e.g.: 20000"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label
                htmlFor="remarks"
                className="text-xs font-medium text-gray-700"
              >
                Remarks
              </Label>
              <Textarea
                id="remarks"
                name="remarks"
                placeholder="e.g.: Documents sent via courier to buyer"
                className="min-h-16 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
                rows={2}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating…
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Create Commercial
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
