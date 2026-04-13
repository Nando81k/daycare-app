"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/hooks/use-pagination";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Transaction = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
};

const statusVariant: Record<
  Transaction["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  completed: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

const transactions: Transaction[] = [
  {
    id: "TXN001",
    customer: "Alice Johnson",
    email: "alice@example.com",
    amount: 250.0,
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "TXN002",
    customer: "Bob Smith",
    email: "bob@example.com",
    amount: 150.0,
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "TXN003",
    customer: "Charlie Brown",
    email: "charlie@example.com",
    amount: 350.0,
    status: "failed",
    date: "2024-01-13",
  },
  {
    id: "TXN004",
    customer: "Diana Prince",
    email: "diana@example.com",
    amount: 450.0,
    status: "completed",
    date: "2024-01-12",
  },
  {
    id: "TXN005",
    customer: "Ethan Hunt",
    email: "ethan@example.com",
    amount: 550.0,
    status: "refunded",
    date: "2024-01-11",
  },
  {
    id: "TXN006",
    customer: "Fiona Apple",
    email: "fiona@example.com",
    amount: 120.0,
    status: "completed",
    date: "2024-01-10",
  },
  {
    id: "TXN007",
    customer: "George Lucas",
    email: "george@example.com",
    amount: 890.0,
    status: "pending",
    date: "2024-01-09",
  },
  {
    id: "TXN008",
    customer: "Hannah Montana",
    email: "hannah@example.com",
    amount: 320.0,
    status: "completed",
    date: "2024-01-08",
  },
  {
    id: "TXN009",
    customer: "Igor Stravinsky",
    email: "igor@example.com",
    amount: 670.0,
    status: "failed",
    date: "2024-01-07",
  },
  {
    id: "TXN010",
    customer: "Julia Roberts",
    email: "julia@example.com",
    amount: 440.0,
    status: "completed",
    date: "2024-01-06",
  },
  {
    id: "TXN011",
    customer: "Kevin Hart",
    email: "kevin@example.com",
    amount: 220.0,
    status: "pending",
    date: "2024-01-05",
  },
  {
    id: "TXN012",
    customer: "Luna Lovegood",
    email: "luna@example.com",
    amount: 180.0,
    status: "completed",
    date: "2024-01-04",
  },
  {
    id: "TXN013",
    customer: "Mike Tyson",
    email: "mike@example.com",
    amount: 920.0,
    status: "refunded",
    date: "2024-01-03",
  },
  {
    id: "TXN014",
    customer: "Nancy Drew",
    email: "nancy@example.com",
    amount: 310.0,
    status: "completed",
    date: "2024-01-02",
  },
  {
    id: "TXN015",
    customer: "Oscar Wilde",
    email: "oscar@example.com",
    amount: 150.0,
    status: "pending",
    date: "2024-01-01",
  },
  {
    id: "TXN016",
    customer: "Patricia Arquette",
    email: "patricia@example.com",
    amount: 480.0,
    status: "completed",
    date: "2023-12-31",
  },
  {
    id: "TXN017",
    customer: "Quincy Jones",
    email: "quincy@example.com",
    amount: 260.0,
    status: "failed",
    date: "2023-12-30",
  },
  {
    id: "TXN018",
    customer: "Rachel Green",
    email: "rachel@example.com",
    amount: 730.0,
    status: "completed",
    date: "2023-12-29",
  },
  {
    id: "TXN019",
    customer: "Steve Rogers",
    email: "steve@example.com",
    amount: 590.0,
    status: "pending",
    date: "2023-12-28",
  },
  {
    id: "TXN020",
    customer: "Tina Turner",
    email: "tina@example.com",
    amount: 410.0,
    status: "completed",
    date: "2023-12-27",
  },
  {
    id: "TXN021",
    customer: "Uma Thurman",
    email: "uma@example.com",
    amount: 670.0,
    status: "refunded",
    date: "2023-12-26",
  },
  {
    id: "TXN022",
    customer: "Victor Hugo",
    email: "victor@example.com",
    amount: 290.0,
    status: "completed",
    date: "2023-12-25",
  },
  {
    id: "TXN023",
    customer: "Wendy Williams",
    email: "wendy@example.com",
    amount: 830.0,
    status: "pending",
    date: "2023-12-24",
  },
  {
    id: "TXN024",
    customer: "Xavier Naidoo",
    email: "xavier@example.com",
    amount: 120.0,
    status: "failed",
    date: "2023-12-23",
  },
  {
    id: "TXN025",
    customer: "Yara Shahidi",
    email: "yara@example.com",
    amount: 560.0,
    status: "completed",
    date: "2023-12-22",
  },
];

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction ID",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <span className="font-medium">{formatted}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Transaction["status"];
      return <Badge variant={statusVariant[status]}>{status}</Badge>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
  },
];

export function DatatableTransaction() {
  "use no memo";
  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const {
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    paginationRange,
    totalPages,
  } = usePagination({
    totalItems: transactions.length,
    itemsPerPage: 5,
  });

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                prevPage();
                table.previousPage();
              }}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </PaginationItem>
          {paginationRange.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  isActive={currentPage === page}
                  onClick={() => {
                    goToPage(page as number);
                    table.setPageIndex((page as number) - 1);
                  }}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                nextPage();
                table.nextPage();
              }}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
