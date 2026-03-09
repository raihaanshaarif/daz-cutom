"use client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/types";

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
        {title}
      </p>
      <div className="rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-start bg-white px-3 py-2">
      <span className="text-xs text-gray-500 leading-5 shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-900 break-words min-w-0">
        {children ?? value ?? <span className="text-gray-400">—</span>}
      </span>
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
  const money = (v?: number | null) =>
    v != null ? `$${Number(v).toFixed(2)}` : "—";

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
    <div className="space-y-5 text-sm">
      {/* Meta */}
      <p className="text-xs text-gray-500">
        Order{" "}
        <span className="font-semibold text-gray-800">{order.orderNumber}</span>
        {"  ·  "}Created {fmt(order.createdAt)}
      </p>

      {/* Order Info */}
      <Section title="Order Information">
        <Row label="Order Number" value={order.orderNumber} />
        <Row label="Ship Date" value={fmt(order.shipDate)} />
        <Row label="Department" value={order.dept} />
        <Row label="Style" value={order.style} />
        <Row label="Color" value={order.color} />
        <Row label="Lot" value={order.lot} />
        <Row label="Quantity" value={order.quantity?.toLocaleString()} />
        <Row label="Payment Term" value={order.paymentTerm} />
        <Row label="Overall Remarks" value={order.overallRemarks} />
      </Section>

      {/* Buyer & Factory */}
      <Section title="Buyer & Factory">
        <Row label="Buyer" value={order.buyer?.name} />
        <Row label="Brand" value={order.buyer?.brand} />
        <Row label="Factory" value={order.factory?.name} />
      </Section>

      {/* Pricing */}
      <Section title="Pricing & Commission">
        <Row label="Unit Price" value={money(order.price)} />
        <Row label="Total Price" value={money(order.totalPrice)} />
        <Row label="Factory Unit Price" value={money(order.factoryUnitPrice)} />
        <Row
          label="Total Factory Price"
          value={money(order.totalFactoryPrice)}
        />
        <Row label="DAZ Commission" value={money(order.dazCommission)} />
        <Row label="Discount (Factory)" value={money(order.discountFactory)} />
        <Row label="Discount (DAZ)" value={money(order.discountFromDaz)} />
        <Row
          label="Discount Remark"
          value={order.discountRemark ?? undefined}
        />
        <Row
          label="Final DAZ Commission"
          value={money(order.finalDazCommission)}
        />
        <Row label="Commission Amount" value={money(order.commissionAmount)} />
        <Row label="Commission Status">
          {order.commissionStatus ? (
            <Badge
              variant="outline"
              className={
                order.commissionStatus === "PAID"
                  ? "text-green-700 border-green-300 bg-green-50 text-[10px] px-1.5 py-0"
                  : "text-yellow-700 border-yellow-300 bg-yellow-50 text-[10px] px-1.5 py-0"
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
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
          Production Stages
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STAGES.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2 gap-2"
            >
              <span className="text-xs text-gray-600 truncate">{label}</span>
              <span className="text-xs font-medium text-gray-800">
                {fmt(value ?? undefined)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />
    </div>
  );
}
