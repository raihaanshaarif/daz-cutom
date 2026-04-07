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
import { ChevronDown, Eye, Edit, Trash2, FileDown } from "lucide-react";
import { useSession } from "next-auth/react";

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
import { OrderItem } from "@/types";

interface OrderTableProps {
  data: OrderItem[];
  onEdit?: (item: OrderItem) => void;
  onView?: (item: OrderItem) => void;
  onDelete?: (item: OrderItem) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function OrderTable({
  data,
  onEdit,
  onView,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: OrderTableProps) {
  const { data: session } = useSession();
  const isAdminOrSuperAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const columns = React.useMemo<ColumnDef<OrderItem>[]>(
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
        accessorKey: "orderNumber",
        header: "Order No",
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <div className="font-medium">
              {row.getValue("orderNumber") || `#${row.original.id}`}
            </div>
            {row.original.isShipped && (
              <div className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded w-fit font-bold uppercase">
                Shipped
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "shipDate",
        header: "Ship Date",
        cell: ({ row }) => {
          const val = row.getValue("shipDate") as string | undefined;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "buyerName",
        header: "Buyer",
        cell: ({ row }) => <div>{row.getValue("buyerName") || "N/A"}</div>,
      },
      {
        accessorKey: "factoryName",
        header: "Factory",
        cell: ({ row }) => <div>{row.getValue("factoryName") || "N/A"}</div>,
      },
      {
        accessorKey: "department",
        header: "Dept",
        cell: ({ row }) => <div>{row.getValue("department") || "N/A"}</div>,
      },
      {
        accessorKey: "style",
        header: "Style",
        cell: ({ row }) => <div>{row.getValue("style") || "N/A"}</div>,
      },
      {
        accessorKey: "color",
        header: "Color",
        cell: ({ row }) => <div>{row.getValue("color") || "N/A"}</div>,
      },
      {
        accessorKey: "lot",
        header: "Lot",
        cell: ({ row }) => <div>{row.getValue("lot") || "N/A"}</div>,
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("quantity") || 0}</div>
        ),
      },
      {
        accessorKey: "unitPrice",
        header: "Price",
        cell: ({ row }) => (
          <div>${((row.getValue("unitPrice") as number) || 0).toFixed(2)}</div>
        ),
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => (
          <div className="font-medium">
            ${((row.getValue("totalPrice") as number) || 0).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "factoryPrice",
        header: "Factory Price",
        cell: ({ row }) => (
          <div>
            ${((row.getValue("factoryPrice") as number) || 0).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "totalFactoryPrice",
        header: "Total Factory Price",
        cell: ({ row }) => (
          <div className="font-medium">
            ${((row.getValue("totalFactoryPrice") as number) || 0).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "yarnBooking",
        header: "Yarn Booking",
        cell: ({ row }) => {
          const val = row.getValue("yarnBooking") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "labYarn",
        header: "Lab-yarn",
        cell: ({ row }) => {
          const val = row.getValue("labYarn") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "printStrikeoff",
        header: "Print Strikeoff",
        cell: ({ row }) => {
          const val = row.getValue("printStrikeoff") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "pp",
        header: "PP",
        cell: ({ row }) => {
          const val = row.getValue("pp") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "bulkFab",
        header: "Bulk Fab",
        cell: ({ row }) => {
          const val = row.getValue("bulkFab") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "cutting",
        header: "Cutting",
        cell: ({ row }) => {
          const val = row.getValue("cutting") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "printing",
        header: "Printing",
        cell: ({ row }) => {
          const val = row.getValue("printing") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "swing",
        header: "Swing",
        cell: ({ row }) => {
          const val = row.getValue("swing") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "finishing",
        header: "Finishing",
        cell: ({ row }) => {
          const val = row.getValue("finishing") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "shipmentSample",
        header: "Shipment Sample",
        cell: ({ row }) => {
          const val = row.getValue("shipmentSample") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "inspection",
        header: "Inspection",
        cell: ({ row }) => {
          const val = row.getValue("inspection") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "exfactory",
        header: "Exfactory",
        cell: ({ row }) => {
          const val = row.getValue("exfactory") as string | null;
          return <div>{formatDate(val)}</div>;
        },
      },
      {
        accessorKey: "dazCommission",
        header: "DAZ Commission",
        cell: ({ row }) => (
          <div>
            ${((row.getValue("dazCommission") as number) || 0).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "finalDazCommission",
        header: "Final Commission",
        cell: ({ row }) => (
          <div className="font-medium">
            ${((row.getValue("finalDazCommission") as number) || 0).toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: "paymentTerm",
        header: "Payment Term",
        cell: ({ row }) => <div>{row.getValue("paymentTerm") || "N/A"}</div>,
      },
      {
        accessorKey: "overallRemarks",
        header: "Overall Remarks",
        cell: ({ row }) => (
          <div className="max-w-xs truncate">
            {row.getValue("overallRemarks") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "isShipped",
        header: "Is Shipped",
        cell: ({ row }) => (
          <div className="flex items-center">
            {row.original.isShipped ? (
              <span className="text-green-600 font-bold text-xs uppercase bg-green-50 px-2 py-0.5 rounded">
                Shipped
              </span>
            ) : (
              <span className="text-gray-400 text-xs">Pending</span>
            )}
          </div>
        ),
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
    data,
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
    // Get visible columns
    const visibleColumns = table
      .getAllColumns()
      .filter(
        (col) =>
          col.getIsVisible() && col.id !== "select" && col.id !== "actions",
      );

    // Create header row
    const headers = visibleColumns.map((col) => {
      const header = col.columnDef.header;
      if (typeof header === "string") return header;
      return col.id;
    });

    // Get filtered rows
    const rows = table.getFilteredRowModel().rows;

    // Create data rows
    const dataRows = rows.map((row) => {
      return visibleColumns.map((col) => {
        const cellValue = row.getValue(col.id);
        // Format dates and handle nulls
        if (cellValue === null || cellValue === undefined) return "";
        if (cellValue instanceof Date) {
          return cellValue.toLocaleDateString();
        }
        return String(cellValue);
      });
    });

    // Combine headers and data
    const csvContent = [
      headers.join(","),
      ...dataRows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
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
      `orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by order number..."
          value={
            (table.getColumn("orderNumber")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("orderNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={exportToExcel}
          className="ml-auto mr-2"
        >
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                    className="capitalize"
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
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-max">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
