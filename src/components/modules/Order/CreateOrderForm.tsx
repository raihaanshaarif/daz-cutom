"use client";
import { createOrder } from "@/actions/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  DollarSign,
  Calendar,
  ShoppingCart,
  Truck,
  ChevronLeft,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Buyer, Factory } from "@/types";

export default function CreateOrderForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [selectedFactoryId, setSelectedFactoryId] = useState("");
  const [selectedCommissionStatus, setSelectedCommissionStatus] =
    useState("PENDING");
  const [isShipped, setIsShipped] = useState(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [factoryUnitPrice, setFactoryUnitPrice] = useState<number | "">("");

  const router = useRouter();

  const totalPrice = quantity * price;
  const totalFactoryPrice =
    factoryUnitPrice !== "" ? quantity * (factoryUnitPrice as number) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [buyersRes, factoriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/factories`),
        ]);
        const buyersData = await buyersRes.json();
        const factoriesData = await factoriesRes.json();
        setBuyers(Array.isArray(buyersData) ? buyersData : []);
        setFactories(Array.isArray(factoriesData) ? factoriesData : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("buyerId", selectedBuyerId);
      formData.set("factoryId", selectedFactoryId);
      formData.set("commissionStatus", selectedCommissionStatus);
      formData.set("isShipped", String(isShipped));
      formData.set("totalPrice", totalPrice.toString());
      if (totalFactoryPrice != null)
        formData.set("totalFactoryPrice", totalFactoryPrice.toString());

      const result = await createOrder(formData);

      if (result?.id) {
        toast.success("Order created successfully!", {
          description: `Order ${result.orderNumber} has been created.`,
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/order/order-list");
        }, 1500);
      } else {
        toast.error("Failed to create order", {
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
            <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Create Order
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Register a new purchase order with buyer and factory details
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
              form="order-form"
              type="submit"
              disabled={isSubmitting}
              className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Placing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </div>

        <form
          id="order-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-7 gap-6"
        >
          {/* Main Info - Left Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Order Identification
                </h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="orderNumber"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      P.O. Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="orderNumber"
                        name="orderNumber"
                        required
                        placeholder="e.g. PO-2024-001"
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="date"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2"
                    >
                      Shipment Date
                    </Label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        defaultValue={new Date().toISOString().split("T")[0]}
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Buyer Name
                    </Label>
                    <Select
                      value={selectedBuyerId}
                      onValueChange={setSelectedBuyerId}
                      required
                    >
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
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
                      Factory Name
                    </Label>
                    <Select
                      value={selectedFactoryId}
                      onValueChange={setSelectedFactoryId}
                      required
                    >
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
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
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <Package className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Product Specifications
                </h2>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="garmentsItem"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Garment Item
                    </Label>
                    <Input
                      id="garmentsItem"
                      name="garmentsItem"
                      placeholder="e.g. T-Shirt, Jeans"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="styleNumber"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Style Number
                    </Label>
                    <Input
                      id="styleNumber"
                      name="styleNumber"
                      placeholder="e.g. ST-442"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="composition"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Fabric Composition
                    </Label>
                    <Input
                      id="composition"
                      name="composition"
                      placeholder="e.g. 100% Cotton"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="color"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Color Variants
                    </Label>
                    <Input
                      id="color"
                      name="color"
                      placeholder="e.g. Navy Blue, Black"
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold text-sm">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Financials
                  </h2>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="quantity"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Order Quantity
                    </Label>
                    <Input
                      type="number"
                      id="quantity"
                      name="quantity"
                      defaultValue={0}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="price"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Unit Price
                    </Label>
                    <div className="relative group">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        type="number"
                        id="price"
                        name="price"
                        step="0.01"
                        defaultValue={0}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="factoryUnitPrice"
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
                    >
                      Factory Price
                    </Label>
                    <div className="relative group">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        type="number"
                        id="factoryUnitPrice"
                        name="factoryUnitPrice"
                        step="0.01"
                        onChange={(e) =>
                          setFactoryUnitPrice(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        className="pl-10 h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      Estimated Total Revenue
                    </span>
                    <span className="font-bold text-blue-600">
                      ${totalPrice.toLocaleString()}
                    </span>
                  </div>
                  {totalFactoryPrice !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Factory Balance</span>
                      <span className="font-bold text-orange-600">
                        ${totalFactoryPrice.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  <Truck className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Logistics & Status
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Commission Status
                    </Label>
                    <Select
                      value={selectedCommissionStatus}
                      onValueChange={setSelectedCommissionStatus}
                    >
                      <SelectTrigger className="h-10 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                        <SelectValue placeholder="Commission Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PARTIAL">Partial</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col gap-0.5">
                      <Label
                        htmlFor="isShipped"
                        className="font-semibold text-sm"
                      >
                        Shipment Status
                      </Label>
                      <span className="text-[10px] text-zinc-500">
                        Mark as Shipped
                      </span>
                    </div>
                    <Checkbox
                      id="isShipped"
                      checked={isShipped}
                      onCheckedChange={(checked) => setIsShipped(!!checked)}
                      className="size-5 border-zinc-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-zinc-900 dark:bg-zinc-900 rounded-2xl p-6 text-white shadow-xl">
              <h1 className="font-bold flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Operational Notes
              </h1>
              <Textarea
                name="remarks"
                placeholder="Internal logistics or quality control notes..."
                className="mt-2 text-sm bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 min-h-[100px] focus:ring-blue-500/20"
              />
              <div className="pt-4 mt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest">
                <span>Auto-sync active</span>
                <span>SECURED NODE</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
