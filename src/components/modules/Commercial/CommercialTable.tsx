/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Database,
  Eye,
  Edit,
  Trash2,
  FileDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { Commercial } from "@/types";
import { useAuthFetch } from "@/hooks/use-auth-fetch";
import { useEffect, useState } from "react";

interface CommercialTableProps {
  data: Commercial[];
  onEdit?: (commercial: Commercial) => void;
  onView?: (commercial: Commercial) => void;
  onDelete?: (commercial: Commercial) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function CommercialTable({
  data,
  onEdit,
  onView,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: CommercialTableProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const userRole = session?.user?.role ?? "";
  const isAdminOrSuperAdmin =
    userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const { authFetch } = useAuthFetch();

  const [filteredData, setFilteredData] = useState<Commercial[]>(data);
  const [userData, setUserData] = useState<any>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Filter commercials based on user role and assigned buyers
  useEffect(() => {
    const filterCommercials = async () => {
      if (isAdminOrSuperAdmin) {
        // Admin and super admin see all commercials
        setFilteredData(data);
        return;
      }

      // For regular users, fetch user data and filter commercials
      if (!userId) return;

      try {
        const userRes = await authFetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/user/${userId}`,
        );
        const user = await userRes.json();
        setUserData(user);

        const assignedBuyerIds =
          user?.assignedBuyers?.map((buyer: any) => buyer.id) || [];

        if (assignedBuyerIds.length === 0) {
          // If no buyers assigned, show no commercials
          setFilteredData([]);
          return;
        }

        // Filter commercials where buyerId exists in assignedBuyers
        const filtered = data.filter((commercial: Commercial) => {
          const orders = commercial.orders as any[];
          const buyerId = orders?.find((o) => o.order?.buyer?.id)?.order?.buyer
            ?.id;

          if (!buyerId) return false;

          // Check if this buyerId is assigned to the user
          return assignedBuyerIds.includes(buyerId);
        });

        setFilteredData(filtered);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setFilteredData([]);
      }
    };

    filterCommercials();
  }, [data, userId, isAdminOrSuperAdmin, authFetch]);

  const columns = React.useMemo<ColumnDef<Commercial>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => onView?.(item)}
                title="View"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                onClick={() => onEdit?.(item)}
                title="Edit"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              {isAdminOrSuperAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete?.(item)}
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        },
      },
      {
        id: "buyerName",
        header: "Buyer Name",
        cell: ({ row }) => {
          // Get the first available buyer name from orders
          const orders = row.original.orders as any[];
          const buyerName =
            orders?.find((o) => o.order?.buyer?.name)?.order?.buyer?.name ||
            "-";
          return (
            <div
              className="capitalize text-blue-700 font-medium"
              title={buyerName}
            >
              {buyerName}
            </div>
          );
        },
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "bookingReference",
        header: "Booking Reference",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("bookingReference")}</div>
        ),
      },
      {
        accessorKey: "invoiceNo",
        header: "Invoice No",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("invoiceNo")}</div>
        ),
      },
      {
        accessorKey: "orders",
        header: "Order Numbers",
        cell: ({ row }) => {
          const orders = row.getValue("orders") as any[];
          const orderNumbers =
            orders
              ?.map((o) => o.order?.orderNumber)
              .filter(Boolean)
              .join(", ") || "-";
          return (
            <div
              className="max-w-32 truncate text-gray-600"
              title={orderNumbers}
            >
              {orderNumbers}
            </div>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <div>{row.getValue("quantity")?.toLocaleString() ?? "0"}</div>
        ),
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => (
          <div>${row.getValue("totalPrice")?.toLocaleString() ?? "0"}</div>
        ),
      },
      {
        accessorKey: "bookingDate",
        header: "Booking Date",
        cell: ({ row }) => {
          const date = row.getValue("bookingDate") as string;
          return <div>{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "handoverDate",
        header: "Handover Date",
        cell: ({ row }) => {
          const date = row.getValue("handoverDate") as string;
          return <div>{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "etd",
        header: "ETD",
        cell: ({ row }) => {
          const date = row.getValue("etd") as string;
          return <div>{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "eta",
        header: "ETA",
        cell: ({ row }) => {
          const date = row.getValue("eta") as string;
          return <div>{formatDate(date)}</div>;
        },
      },
      {
        accessorKey: "documentStatus",
        header: "Document Status",
        cell: ({ row }) => {
          const status = row.getValue("documentStatus") as string;
          return (
            <div className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium capitalize bg-blue-100 text-blue-800">
              {status.replace("_", " ").toLowerCase()}
            </div>
          );
        },
      },
      {
        accessorKey: "lacAmount",
        header: "LAC Value",
        cell: ({ row }) => (
          <div>${row.getValue("lacAmount")?.toLocaleString() ?? "0"}</div>
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => {
          const status = row.getValue("paymentStatus") as string;
          const statusColors = {
            PENDING: "bg-yellow-100 text-yellow-800",
            PARTIALLY_PAID: "bg-blue-100 text-blue-800",
            PAID: "bg-green-100 text-green-800",
            SURRENDERED: "bg-indigo-100 text-indigo-800",
          };
          return (
            <div
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium capitalize ${
                statusColors[status as keyof typeof statusColors] ||
                "bg-gray-100 text-gray-800"
              }`}
            >
              {status.replace("_", " ").toLowerCase()}
            </div>
          );
        },
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => (
          <div>${row.getValue("balance")?.toLocaleString() ?? "0"}</div>
        ),
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => {
          const remarks = row.getValue("remarks") as string;
          return (
            <div className="max-w-32 truncate text-gray-600" title={remarks}>
              {remarks || "-"}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
          const rawDate = row.getValue("createdAt") as string;
          return <div>{formatDate(rawDate)}</div>;
        },
      },
    ],
    [onEdit, onView, onDelete, isAdminOrSuperAdmin],
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const exportToExcel = () => {
    // Get visible columns (exclude select and actions)
    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() && col.id !== "select" && col.id !== "actions",
      );

    // Get headers
    const headers = visibleColumns.map((col) => col.id);

    // Get filtered rows
    const rows = table.getFilteredRowModel().rows.map((row) => {
      return visibleColumns.map((col) => {
        const value = row.getValue(col.id);
        // Handle null/undefined
        if (value === null || value === undefined) return "";
        // Format dates
        if (col.id.toLowerCase().includes("date") && value instanceof Date) {
          return formatDate(value.toISOString());
        }
        // Handle objects (like nested buyer/factory)
        if (typeof value === "object") return JSON.stringify(value);
        // Escape quotes for CSV
        return String(value).replace(/"/g, '""');
      });
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `commercials_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded flex items-center justify-center">
            <ArrowUpDown className="w-3 h-3 text-white" />
          </div>
          <h2 className="text-xs font-medium text-gray-900">Commercials</h2>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search booking reference..."
            value={
              (table
                .getColumn("bookingReference")
                ?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn("bookingReference")
                ?.setFilterValue(event.target.value)
            }
            className="h-7 w-40 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
          <Input
            placeholder="Search invoice..."
            value={
              (table.getColumn("invoiceNo")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("invoiceNo")?.setFilterValue(event.target.value)
            }
            className="h-7 w-40 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="h-7 px-2 text-xs border-gray-200 hover:border-blue-500 mr-1.5"
          >
            <FileDown className="mr-1 h-3 w-3" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs border-gray-200 hover:border-blue-500"
              >
                Columns <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-200/50 h-8">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-8 px-3 text-xs font-medium text-gray-700 uppercase tracking-wide"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-gray-200/50 hover:bg-gray-50/50 h-9"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-3 py-2 text-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-16 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Database className="w-6 h-6 text-gray-300" />
                    <p className="text-xs">No commercials found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-3">
        <div className="text-xs text-gray-500">
          Page {currentPage} of {totalPages} ({filteredData.length} commercials)
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="h-6 px-2 text-xs border-gray-200 hover:border-blue-500"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="h-6 px-2 text-xs border-gray-200 hover:border-blue-500"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
