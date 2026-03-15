"use client";

import { useState, useEffect } from "react";
import { Commercial, CommercialFormData, Order } from "@/types";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Edit } from "lucide-react";

interface EditCommercialFormProps {
  commercial: Commercial | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCommercialForm({
  commercial,
  isOpen,
  onClose,
  onSuccess,
}: EditCommercialFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CommercialFormData>({
    bookingReference: "",
    invoiceNo: "",
    quantity: 0,
    totalPrice: 0,
    bookingDate: "",
    bookingHandoverDate: "",
    handoverDate: "",
    etd: "",
    eta: "",
    lacAmount: 0,
    documentStatus: "PREPARING",
    docCourierNo: "",
    approximatePaymentDate: null,
    paymentStatus: "PENDING",
    receivedAmount: 0,
    receivedDate: "",
    balance: 0,
    remarks: "",
  });
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [orderSearch, setOrderSearch] = useState("");

  // Populate form when commercial changes
  useEffect(() => {
    if (commercial) {
      setFormData({
        bookingReference: commercial.bookingReference,
        invoiceNo: commercial.invoiceNo,
        quantity: commercial.quantity,
        totalPrice: commercial.totalPrice,
        bookingDate: commercial.bookingDate
          ? commercial.bookingDate.split("T")[0]
          : "", // Convert to date input format
        bookingHandoverDate: commercial.bookingHandoverDate
          ? commercial.bookingHandoverDate.split("T")[0]
          : "",
        handoverDate: commercial.handoverDate
          ? commercial.handoverDate.split("T")[0]
          : "",
        etd: commercial.etd ? commercial.etd.split("T")[0] : "",
        eta: commercial.eta ? commercial.eta.split("T")[0] : "",
        lacAmount: commercial.lacAmount,
        documentStatus: commercial.documentStatus,
        docCourierNo: commercial.docCourierNo,
        approximatePaymentDate: commercial.approximatePaymentDate
          ? commercial.approximatePaymentDate.split("T")[0]
          : null,
        paymentStatus: commercial.paymentStatus,
        receivedAmount: commercial.receivedAmount,
        receivedDate: commercial.receivedDate
          ? commercial.receivedDate.split("T")[0]
          : "",
        balance: commercial.balance,
        remarks: commercial.remarks,
      });
    }
  }, [commercial]);

  // Fetch available orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/order/orders?page=1&limit=100`,
        );
        if (res.ok) {
          const data = await res.json();
          const ordersArray = Array.isArray(data) ? data : data?.data || [];
          setAvailableOrders(ordersArray);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen]);

  // Set selected orders when commercial changes
  useEffect(() => {
    if (commercial && commercial.orders) {
      const orderIds = commercial.orders.map((co) => co.orderId);
      setSelectedOrderIds(orderIds);
    } else {
      setSelectedOrderIds([]);
    }
  }, [commercial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commercial) return;

    setLoading(true);
    try {
      // Prepare data object for JSON request
      const dataToSend: Record<string, unknown> = {};

      // Only send fields that have changed from the original commercial
      Object.entries(formData).forEach(([key, value]) => {
        const originalValue = commercial[key as keyof Commercial];

        // Handle date fields
        if (/(Date|At)$/i.test(key) && typeof value === "string") {
          const dateVal = new Date(value);
          if (!isNaN(dateVal.getTime())) {
            const isoString = dateVal.toISOString();
            if (originalValue !== isoString) {
              dataToSend[key] = isoString;
            }
          }
          return;
        }

        // For other fields, send if they've changed
        if (value !== originalValue) {
          dataToSend[key] = value;
        }
      });

      // Check if orders changed
      const originalOrderIds =
        commercial.orders?.map((co) => co.orderId).sort() || [];
      const currentOrderIds = selectedOrderIds.sort();
      if (
        JSON.stringify(originalOrderIds) !== JSON.stringify(currentOrderIds)
      ) {
        dataToSend.orderIds = currentOrderIds;
      }

      console.log("Original order IDs:", originalOrderIds);
      console.log("Current order IDs:", currentOrderIds);
      console.log("Data to send:", dataToSend);

      // Ensure we have at least some data to update
      if (Object.keys(dataToSend).length === 0) {
        toast.error("No changes to update");
        setLoading(false);
        return;
      }

      console.log("Updating commercial with data:", dataToSend);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/commercial/${commercial.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        },
      );

      if (res.ok) {
        toast.success("Commercial updated successfully!");
        onSuccess();
        onClose();
      } else {
        let errorMessage = "Failed to update commercial";
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } else {
            const textResponse = await res.text();
            console.error("Non-JSON error response:", textResponse);
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          errorMessage = `Failed to update commercial (${res.status})`;
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating commercial:", error);
      toast.error("Failed to update commercial");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CommercialFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            Edit Commercial
          </DialogTitle>
          <DialogDescription>
            Update the commercial information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingReference" className="text-sm font-medium">
                Booking Reference *
              </Label>
              <Input
                id="bookingReference"
                value={formData.bookingReference}
                onChange={(e) =>
                  handleInputChange("bookingReference", e.target.value)
                }
                required
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNo" className="text-sm font-medium">
                Invoice No *
              </Label>
              <Input
                id="invoiceNo"
                value={formData.invoiceNo}
                onChange={(e) => handleInputChange("invoiceNo", e.target.value)}
                required
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  handleInputChange("quantity", parseInt(e.target.value))
                }
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPrice" className="text-sm font-medium">
                Total Price
              </Label>
              <Input
                id="totalPrice"
                type="number"
                step="0.01"
                value={formData.totalPrice}
                onChange={(e) =>
                  handleInputChange("totalPrice", parseFloat(e.target.value))
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingDate" className="text-sm font-medium">
                Booking Date
              </Label>
              <Input
                id="bookingDate"
                type="date"
                value={formData.bookingDate}
                onChange={(e) =>
                  handleInputChange("bookingDate", e.target.value)
                }
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="bookingHandoverDate"
                className="text-sm font-medium"
              >
                Booking Handover Date
              </Label>
              <Input
                id="bookingHandoverDate"
                type="date"
                value={formData.bookingHandoverDate}
                onChange={(e) =>
                  handleInputChange("bookingHandoverDate", e.target.value)
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="handoverDate" className="text-sm font-medium">
                Handover Date
              </Label>
              <Input
                id="handoverDate"
                type="date"
                value={formData.handoverDate}
                onChange={(e) =>
                  handleInputChange("handoverDate", e.target.value)
                }
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="etd" className="text-sm font-medium">
                ETD
              </Label>
              <Input
                id="etd"
                type="date"
                value={formData.etd}
                onChange={(e) => handleInputChange("etd", e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eta" className="text-sm font-medium">
                ETA
              </Label>
              <Input
                id="eta"
                type="date"
                value={formData.eta}
                onChange={(e) => handleInputChange("eta", e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lacAmount" className="text-sm font-medium">
                LAC Amount
              </Label>
              <Input
                id="lacAmount"
                type="number"
                step="0.01"
                value={formData.lacAmount}
                onChange={(e) =>
                  handleInputChange("lacAmount", parseFloat(e.target.value))
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="documentStatus" className="text-sm font-medium">
                Document Status
              </Label>
              <Select
                value={formData.documentStatus}
                onValueChange={(value) =>
                  handleInputChange("documentStatus", value)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PREPARING">Preparing</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="REVISED">Revised</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="docCourierNo" className="text-sm font-medium">
                Doc Courier No
              </Label>
              <Input
                id="docCourierNo"
                value={formData.docCourierNo}
                onChange={(e) =>
                  handleInputChange("docCourierNo", e.target.value)
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="approximatePaymentDate"
                className="text-sm font-medium"
              >
                Approximate Payment Date
              </Label>
              <Input
                id="approximatePaymentDate"
                type="date"
                value={formData.approximatePaymentDate || ""}
                onChange={(e) =>
                  handleInputChange("approximatePaymentDate", e.target.value)
                }
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus" className="text-sm font-medium">
                Payment Status
              </Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value) =>
                  handleInputChange("paymentStatus", value)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="receivedAmount" className="text-sm font-medium">
                Received Amount
              </Label>
              <Input
                id="receivedAmount"
                type="number"
                step="0.01"
                value={formData.receivedAmount}
                onChange={(e) =>
                  handleInputChange(
                    "receivedAmount",
                    parseFloat(e.target.value),
                  )
                }
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receivedDate" className="text-sm font-medium">
                Received Date
              </Label>
              <Input
                id="receivedDate"
                type="date"
                value={formData.receivedDate}
                onChange={(e) =>
                  handleInputChange("receivedDate", e.target.value)
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="balance" className="text-sm font-medium">
                Balance
              </Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={formData.balance}
                onChange={(e) =>
                  handleInputChange("balance", parseFloat(e.target.value))
                }
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks" className="text-sm font-medium">
              Remarks
            </Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Associated Orders</Label>

            {/* Current Selected Orders */}
            {selectedOrderIds.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-600">
                  Current Orders ({selectedOrderIds.length})
                </Label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
                  {selectedOrderIds.map((orderId) => {
                    const commercialOrder = commercial?.orders?.find(
                      (co) => co.orderId === orderId,
                    );
                    const order = commercialOrder?.order;
                    return (
                      <div
                        key={orderId}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border shadow-sm"
                      >
                        <span className="text-sm font-medium">
                          {order ? order.orderNumber : `Order ${orderId}`}
                        </span>
                        {order && (
                          <span className="text-xs text-gray-500">
                            - {order.style} ({order.buyer?.name})
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrderIds((prev) =>
                              prev.filter((id) => id !== orderId),
                            )
                          }
                          className="text-red-500 hover:text-red-700 ml-2"
                          title="Remove order"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add New Orders */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-600">
                Add Orders
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search orders by name..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="flex-1 h-9"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-2 bg-white">
                {availableOrders
                  .filter((order) =>
                    order.orderNumber
                      .toLowerCase()
                      .includes(orderSearch.toLowerCase()),
                  )
                  .slice(0, 20)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {order.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.style} • {order.buyer?.name} • Qty:{" "}
                          {order.quantity}
                        </div>
                      </div>
                      {selectedOrderIds.includes(order.id) ? (
                        <div className="text-xs text-green-600 font-medium">
                          Already added
                        </div>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setSelectedOrderIds((prev) => [...prev, order.id])
                          }
                          className="h-7 px-2 text-xs"
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  ))}
                {availableOrders.filter((order) =>
                  order.orderNumber
                    .toLowerCase()
                    .includes(orderSearch.toLowerCase()),
                ).length === 0 &&
                  orderSearch && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No orders found matching &ldquo;{orderSearch}&rdquo;
                    </div>
                  )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Commercial
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
