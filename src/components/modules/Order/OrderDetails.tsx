"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  User,
  Building2,
  CreditCard,
  Calendar,
  Clock,
  Tag,
  CircleDollarSign,
  Info,
  Layers,
  Truck,
  Hash,
  FileText,
} from "lucide-react";
import { Order } from "@/types";

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="py-3 px-4 border-b bg-gray-50/50">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-50">{children}</div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  icon: Icon,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  icon?: any;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-center px-4 py-2.5 hover:bg-gray-50/30 transition-colors">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <span>{label}</span>
      </div>
      <div className="text-sm font-medium text-gray-900 break-words">
        {children ?? value ?? <span className="text-gray-400">—</span>}
      </div>
    </div>
  );
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const fmtFull = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";

  const money = (v?: number | null) =>
    v != null
      ? `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "—";

  const STAGES: { label: string; value?: string | null }[] = [
    {
      label: "Yarn Booking",
      value: order.yarnBooking as string | null | undefined,
    },
    {
      label: "Lab Dip / Yarn Dip",
      value: order.labdipYarndip as string | null | undefined,
    },
    {
      label: "Print Strike-Off",
      value: order.printStrikeOff as string | null | undefined,
    },
    { label: "PP Sample", value: order.ppSample as string | null | undefined },
    {
      label: "Bulk Fabric",
      value: order.bulkFabric as string | null | undefined,
    },
    { label: "Cutting", value: order.cutting as string | null | undefined },
    { label: "Printing", value: order.printing as string | null | undefined },
    { label: "Swing", value: order.swing as string | null | undefined },
    { label: "Finishing", value: order.finishing as string | null | undefined },
    {
      label: "Shipment Sample",
      value: order.shipmentSample as string | null | undefined,
    },
    {
      label: "Inspection",
      value: order.inspection as string | null | undefined,
    },
    {
      label: "Ex-Factory",
      value: order.exFactory as string | null | undefined,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-lg shadow-md shadow-blue-200">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-none">
              Order {order.orderNumber}
            </h3>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              Placed on {fmtFull(order.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-baseline gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Total:</span>
          <span className="text-lg font-bold text-blue-700">
            {money(order.totalPrice)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Order Info */}
        <Section title="General Information" icon={Info}>
          <Row label="Order Number" value={order.orderNumber} icon={Tag} />
          <Row label="Ship Date" value={fmt(order.shipDate)} icon={Calendar} />
          <Row label="Department" value={order.dept} icon={Layers} />
          <Row label="Style" value={order.style} icon={Tag} />
          <Row label="Color" value={order.color} icon={Tag} />
          <Row label="Lot" value={order.lot} icon={Hash} />
          <Row
            label="Quantity"
            value={order.quantity?.toLocaleString()}
            icon={Layers}
          />
          <Row
            label="Payment Term"
            value={order.paymentTerm}
            icon={CreditCard}
          />
          <Row
            label="Overall Remarks"
            value={order.overallRemarks}
            icon={FileText}
          />
        </Section>

        {/* Buyer & Factory */}
        <Section title="Stakeholders" icon={Building2}>
          <Row label="Buyer" value={order.buyer?.name} icon={User} />
          <Row label="Brand" value={order.buyer?.brand} icon={Tag} />
          <Row label="Factory" value={order.factory?.name} icon={Building2} />
        </Section>

        {/* Pricing */}
        <Section title="Financial Details" icon={CircleDollarSign}>
          <Row label="Unit Price" value={money(order.price)} />
          <Row label="Total Price" value={money(order.totalPrice)} />
          <Row
            label="Factory Unit Price"
            value={money(order.factoryUnitPrice)}
          />
          <Row
            label="Total Factory Price"
            value={money(order.totalFactoryPrice)}
          />
          <Row
            label="Commission Amount"
            value={money(order.commissionAmount)}
          />
          <Row label="Commission Status">
            {order.commissionStatus ? (
              <Badge
                variant="outline"
                className={
                  order.commissionStatus === "PAID"
                    ? "text-green-700 border-green-200 bg-green-50 px-2 py-0.5"
                    : "text-amber-700 border-amber-200 bg-amber-50 px-2 py-0.5"
                }
              >
                {order.commissionStatus}
              </Badge>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </Row>
        </Section>

        {/* Production Stages */}
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b bg-gray-50/50">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-700">
              <Layers className="w-4 h-4" />
              Production Track
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-gray-50/20">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {STAGES.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col bg-white border border-gray-100 rounded-lg p-2.5 shadow-sm hover:border-blue-100 hover:shadow-md transition-all group"
                >
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                    {label}
                  </span>
                  <span className="text-xs font-semibold text-gray-700 mt-1">
                    {fmt(value ?? undefined)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-2">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Created: {fmt(order.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Updated: {fmt(order.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
