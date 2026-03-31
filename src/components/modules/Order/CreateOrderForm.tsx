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
import { Package, UserRoundPlus, User, DollarSign } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Buyer, Factory } from "@/types";

function SectionTitle({
  icon,
  color,
  title,
}: {
  icon: React.ReactNode;
  color: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className={`w-6 h-6 bg-gradient-to-r ${color} rounded-md flex items-center justify-center`}
      >
        {icon}
      </div>
      <h2 className="text-sm font-medium text-gray-900">{title}</h2>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      {children}
    </div>
  );
}

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

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
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
    <div className="min-h-screen bg-background py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-2 shadow-md">
            <UserRoundPlus className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
            Create New Order
          </h1>
          <p className="text-gray-500 text-xs">
            Create a new order with buyer and factory details.
          </p>
        </div>

        <form
          action={handleSubmit}
          className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden"
        >
          <div className="p-4 lg:p-6 space-y-6">
            {/* Order Information */}
            <section>
              <SectionTitle
                icon={<Package className="w-3.5 h-3.5 text-white" />}
                color="from-green-500 to-green-600"
                title="Order Information"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Order Number *">
                  <Input
                    name="orderNumber"
                    required
                    placeholder="ORD-001"
                    className="h-8 border-gray-200 focus:border-green-500"
                  />
                </Field>

                <Field label="Ship Date">
                  <Input
                    name="shipDate"
                    type="date"
                    className="h-8 border-gray-200 focus:border-green-500"
                  />
                </Field>

                <Field label="Buyer">
                  <Select
                    value={selectedBuyerId}
                    onValueChange={setSelectedBuyerId}
                  >
                    <SelectTrigger className="h-8 border-gray-200">
                      <SelectValue placeholder="Select buyer" />
                    </SelectTrigger>
                    <SelectContent>
                      {buyers.map((b) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Factory">
                  <Select
                    value={selectedFactoryId}
                    onValueChange={setSelectedFactoryId}
                  >
                    <SelectTrigger className="h-8 border-gray-200">
                      <SelectValue placeholder="Select factory" />
                    </SelectTrigger>
                    <SelectContent>
                      {factories.map((f) => (
                        <SelectItem key={f.id} value={f.id.toString()}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Payment Term">
                  <Input
                    name="paymentTerm"
                    placeholder="e.g. Net 30"
                    className="h-8 border-gray-200 focus:border-green-500"
                  />
                </Field>
              </div>
            </section>

            {/* Product Details */}
            <section>
              <SectionTitle
                icon={<Package className="w-3.5 h-3.5 text-white" />}
                color="from-blue-500 to-blue-600"
                title="Product Details"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <Field label="Department">
                  <Input
                    name="dept"
                    placeholder="Department"
                    className="h-8 border-gray-200 focus:border-blue-500"
                  />
                </Field>

                <Field label="Style">
                  <Input
                    name="style"
                    placeholder="Style"
                    className="h-8 border-gray-200 focus:border-blue-500"
                  />
                </Field>

                <Field label="Color">
                  <Input
                    name="color"
                    placeholder="Color"
                    className="h-8 border-gray-200 focus:border-blue-500"
                  />
                </Field>

                <Field label="Lot">
                  <Input
                    name="lot"
                    placeholder="Lot"
                    className="h-8 border-gray-200 focus:border-blue-500"
                  />
                </Field>

                <Field label="Quantity *">
                  <Input
                    name="quantity"
                    type="number"
                    min="1"
                    required
                    placeholder="0"
                    className="h-8 border-gray-200 focus:border-blue-500"
                    value={quantity || ""}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  />
                </Field>

                <Field label="Unit Price *">
                  <Input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="h-8 border-gray-200 focus:border-blue-500"
                    value={price || ""}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  />
                </Field>

                <Field label="Total Price">
                  <Input
                    value={`$${totalPrice.toFixed(2)}`}
                    className="h-8 bg-gray-50 text-gray-600"
                    readOnly
                  />
                </Field>

                <Field label="Factory Unit Price">
                  <Input
                    name="factoryUnitPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="h-8 border-gray-200 focus:border-blue-500"
                    value={factoryUnitPrice}
                    onChange={(e) =>
                      setFactoryUnitPrice(
                        e.target.value === ""
                          ? ""
                          : parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </Field>

                <Field label="Total Factory Price">
                  <Input
                    value={
                      totalFactoryPrice != null
                        ? `$${totalFactoryPrice.toFixed(2)}`
                        : "—"
                    }
                    className="h-8 bg-gray-50 text-gray-600"
                    readOnly
                  />
                </Field>
              </div>
            </section>

            {/* Commission & Pricing */}
            <section>
              <SectionTitle
                icon={<DollarSign className="w-3.5 h-3.5 text-white" />}
                color="from-purple-500 to-purple-600"
                title="Commission & Pricing"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="DAZ Commission">
                  <Input
                    name="dazCommission"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="h-8 border-gray-200 focus:border-purple-500"
                  />
                </Field>

                <Field label="Discount (Factory)">
                  <Input
                    name="discountFactory"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="h-8 border-gray-200 focus:border-purple-500"
                  />
                </Field>

                <Field label="Discount (DAZ)">
                  <Input
                    name="discountFromDaz"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="h-8 border-gray-200 focus:border-purple-500"
                  />
                </Field>

                <Field label="Discount Remark">
                  <Input
                    name="discountRemark"
                    placeholder="Remark"
                    className="h-8 border-gray-200 focus:border-purple-500"
                  />
                </Field>

                <Field label="Final DAZ Commission">
                  <Input
                    name="finalDazCommission"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="h-8 border-gray-200 focus:border-purple-500"
                  />
                </Field>

                <Field label="Commission Status">
                  <Select
                    value={selectedCommissionStatus}
                    onValueChange={setSelectedCommissionStatus}
                  >
                    <SelectTrigger className="h-8 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Commission Amount">
                  <Input
                    name="commissionAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="h-8 border-gray-200 focus:border-purple-500"
                  />
                </Field>
              </div>
            </section>

            {/* Remarks */}
            <section>
              <SectionTitle
                icon={<User className="w-3.5 h-3.5 text-white" />}
                color="from-orange-500 to-orange-600"
                title="Remarks"
              />
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id="isShipped"
                  checked={isShipped}
                  onCheckedChange={(checked) => setIsShipped(!!checked)}
                />
                <Label
                  htmlFor="isShipped"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Has this order been shipped?
                </Label>
              </div>
              <Field label="Overall Remarks">
                <Textarea
                  name="overallRemarks"
                  placeholder="Additional notes or special instructions..."
                  className="min-h-20 border-gray-200 focus:border-orange-500 resize-none"
                  rows={3}
                />
              </Field>
            </section>

            {/* Submit */}
            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Order...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserRoundPlus className="w-5 h-5" />
                    Create Order
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
