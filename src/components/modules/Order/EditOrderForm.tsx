"use client";
import { updateOrder } from "@/actions/create";
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
import { Package, User, Building, DollarSign } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Buyer, Factory, Order } from "@/types";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

const DATE_STAGES: { key: keyof Order; label: string }[] = [
  { key: "yarnBooking", label: "Yarn Booking" },
  { key: "labdipYarndip", label: "Lab Dip / Yarn Dip" },
  { key: "printStrikeOff", label: "Print Strike-Off" },
  { key: "ppSample", label: "PP Sample" },
  { key: "bulkFabric", label: "Bulk Fabric" },
  { key: "cutting", label: "Cutting" },
  { key: "printing", label: "Printing" },
  { key: "swing", label: "Swing" },
  { key: "finishing", label: "Finishing" },
  { key: "shipmentSample", label: "Shipment Sample" },
  { key: "inspection", label: "Inspection" },
  { key: "exFactory", label: "Ex-Factory" },
];

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
    <div className="flex items-center gap-2">
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

interface EditOrderFormProps {
  order: Order;
  onClose: () => void;
}

export default function EditOrderForm({ order, onClose }: EditOrderFormProps) {
  const { authFetch, isLoading: isAuthLoading } = useAuthFetch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(
    order.buyerId?.toString() ?? "",
  );
  const [selectedFactoryId, setSelectedFactoryId] = useState(
    order.factoryId?.toString() ?? "",
  );
  const [selectedCommissionStatus, setSelectedCommissionStatus] = useState(
    order.commissionStatus ?? "",
  );
  const [isShipped, setIsShipped] = useState(order.isShipped ?? false);

  const numDefault = (v?: number | null) => (v != null ? String(v) : "");
  const dateDefault = (v?: string | null) =>
    v ? new Date(v).toISOString().split("T")[0] : "";

  const [stages, setStages] = useState<Record<string, string>>(
    Object.fromEntries(
      DATE_STAGES.map(({ key }) => [
        key,
        dateDefault(order[key] as string | null),
      ]),
    ),
  );

  useEffect(() => {
    if (isAuthLoading) return;

    const fetchData = async () => {
      try {
        const [buyersRes, factoriesRes] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/buyers`),
          authFetch(`${process.env.NEXT_PUBLIC_BASE_API}/order/factories`),
        ]);
        const buyersData = await buyersRes.json();
        const factoriesData = await factoriesRes.json();
        setBuyers(buyersData?.data || []);
        setFactories(factoriesData?.data || []);
      } catch (err) {
        console.error("Failed to fetch buyers/factories", err);
      }
    };
    fetchData();
  }, [authFetch, isAuthLoading]);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      DATE_STAGES.forEach(({ key }) =>
        formData.append(key as string, stages[key as string] || ""),
      );
      // ensure controlled select values are in FormData
      formData.set("buyerId", selectedBuyerId);
      formData.set("factoryId", selectedFactoryId);
      formData.set("commissionStatus", selectedCommissionStatus);
      formData.set("isShipped", String(isShipped));

      const result = await updateOrder(order.id, formData);

      if (result?.data?.id) {
        toast.success("Order updated successfully!", {
          description: `Order ${result.orderNumber} has been updated.`,
          duration: 4000,
        });
        onClose();
      } else {
        toast.error("Failed to update order", {
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
    <form action={handleSubmit} className="space-y-6">
      {/* Order Info */}
      <section>
        <SectionTitle
          icon={<Package className="w-3.5 h-3.5 text-white" />}
          color="from-green-500 to-green-600"
          title="Order Information"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <Field label="Order Number *">
            <Input
              name="orderNumber"
              required
              defaultValue={order.orderNumber}
              className="h-8"
            />
            {order.isShipped && (
              <div className="mt-2.5">
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-green-200">
                  Currently Shipped
                </span>
              </div>
            )}
          </Field>
          <Field label="Ship Date">
            <Input
              name="shipDate"
              type="date"
              defaultValue={dateDefault(order.shipDate)}
              className="h-8"
            />
          </Field>
          <Field label="Department">
            <Input
              name="dept"
              defaultValue={order.dept ?? ""}
              className="h-8"
            />
          </Field>
          <Field label="Style">
            <Input
              name="style"
              defaultValue={order.style ?? ""}
              className="h-8"
            />
          </Field>
          <Field label="Color">
            <Input
              name="color"
              defaultValue={order.color ?? ""}
              className="h-8"
            />
          </Field>
          <Field label="Lot">
            <Input name="lot" defaultValue={order.lot ?? ""} className="h-8" />
          </Field>
          <Field label="Quantity">
            <Input
              name="quantity"
              type="number"
              min="0"
              defaultValue={numDefault(order.quantity)}
              className="h-8"
            />
          </Field>
          <Field label="Payment Term">
            <Input
              name="paymentTerm"
              defaultValue={order.paymentTerm ?? ""}
              className="h-8"
            />
          </Field>
        </div>
      </section>

      {/* Buyer & Factory */}
      <section>
        <SectionTitle
          icon={<User className="w-3.5 h-3.5 text-white" />}
          color="from-purple-500 to-purple-600"
          title="Buyer & Factory"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <Field label="Buyer">
            <Select value={selectedBuyerId} onValueChange={setSelectedBuyerId}>
              <SelectTrigger className="h-8">
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
              <SelectTrigger className="h-8">
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
        </div>
      </section>

      {/* Pricing & Commission */}
      <section>
        <SectionTitle
          icon={<DollarSign className="w-3.5 h-3.5 text-white" />}
          color="from-blue-500 to-blue-600"
          title="Pricing & Commission"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <Field label="Unit Price">
            <Input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numDefault(order.price)}
              className="h-8"
            />
          </Field>
          <Field label="Factory Unit Price">
            <Input
              name="factoryUnitPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numDefault(order.factoryUnitPrice)}
              className="h-8"
            />
          </Field>
          <Field label="DAZ Commission">
            <Input
              name="dazCommission"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numDefault(order.dazCommission)}
              className="h-8"
            />
          </Field>
          <Field label="Discount (Factory)">
            <Input
              name="discountFactory"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numDefault(order.discountFactory)}
              className="h-8"
            />
          </Field>
          <Field label="Discount (DAZ)">
            <Input
              name="discountFromDaz"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numDefault(order.discountFromDaz)}
              className="h-8"
            />
          </Field>
          <Field label="Final DAZ Commission">
            <Input
              name="finalDazCommission"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numDefault(order.finalDazCommission)}
              className="h-8"
            />
          </Field>
          <Field label="Commission Amount">
            <Input
              name="commissionAmount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numDefault(order.commissionAmount)}
              className="h-8"
            />
          </Field>
          <Field label="Commission Status">
            <Select
              value={selectedCommissionStatus}
              onValueChange={setSelectedCommissionStatus}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PARTIALLY_RECEIVED">
                  Partially Received
                </SelectItem>
                <SelectItem value="RECEIVED">Received</SelectItem>
                <SelectItem value="SURRENDERED">Surrendered</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Discount Remark">
            <Input
              name="discountRemark"
              defaultValue={order.discountRemark ?? ""}
              className="h-8"
            />
          </Field>
        </div>
      </section>

      {/* Production Stages */}
      <section>
        <SectionTitle
          icon={<Building className="w-3.5 h-3.5 text-white" />}
          color="from-orange-500 to-orange-600"
          title="Production Stages"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {DATE_STAGES.map(({ key, label }) => (
            <div key={key as string} className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">
                {label}
              </Label>
              <Input
                type="date"
                value={stages[key as string]}
                onChange={(e) =>
                  setStages((s) => ({ ...s, [key as string]: e.target.value }))
                }
                className="h-8"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Overall Remarks */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
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
            rows={3}
            defaultValue={order.overallRemarks ?? ""}
            className="resize-none"
          />
        </Field>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
