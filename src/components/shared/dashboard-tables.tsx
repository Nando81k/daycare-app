"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { billingRecords, childrenRoster, enrollmentLeads, staffRoster } from "@/data/admin"
import { parentDocuments, parentInvoices, pickupContacts } from "@/data/parent"
import { formatCurrency } from "@/lib/format"
import { DataTable } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"

const pickupColumns: ColumnDef<(typeof pickupContacts)[number]>[] = [
  {
    accessorKey: "name",
    header: "Contact",
  },
  {
    accessorKey: "relationship",
    header: "Relationship",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className="rounded-full capitalize">
        {row.original.status}
      </Badge>
    ),
  },
]

const invoiceColumns: ColumnDef<(typeof parentInvoices)[number]>[] = [
  {
    accessorKey: "id",
    header: "Invoice",
  },
  {
    accessorKey: "dueDate",
    header: "Due date",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className="rounded-full capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "method",
    header: "Method",
  },
]

const documentColumns: ColumnDef<(typeof parentDocuments)[number]>[] = [
  {
    accessorKey: "title",
    header: "Document",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className="rounded-full capitalize">
        {row.original.status}
      </Badge>
    ),
  },
]

const enrollmentColumns: ColumnDef<(typeof enrollmentLeads)[number]>[] = [
  {
    accessorKey: "family",
    header: "Family",
  },
  {
    accessorKey: "child",
    header: "Child",
  },
  {
    accessorKey: "program",
    header: "Program",
  },
  {
    accessorKey: "tourDate",
    header: "Tour",
  },
  {
    accessorKey: "stage",
    header: "Stage",
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <Badge variant="secondary" className="rounded-full">
        {row.original.priority}
      </Badge>
    ),
  },
]

const childrenColumns: ColumnDef<(typeof childrenRoster)[number]>[] = [
  {
    accessorKey: "name",
    header: "Child",
  },
  {
    accessorKey: "classroom",
    header: "Classroom",
  },
  {
    accessorKey: "family",
    header: "Family",
  },
  {
    accessorKey: "attendance",
    header: "Attendance",
    cell: ({ row }) => (
      <Badge variant="secondary" className="rounded-full">
        {row.original.attendance}
      </Badge>
    ),
  },
  {
    accessorKey: "pickup",
    header: "Pickup contact",
  },
]

const staffColumns: ColumnDef<(typeof staffRoster)[number]>[] = [
  {
    accessorKey: "name",
    header: "Staff",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "shift",
    header: "Shift",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className="rounded-full">
        {row.original.status}
      </Badge>
    ),
  },
]

const billingColumns: ColumnDef<(typeof billingRecords)[number]>[] = [
  {
    accessorKey: "family",
    header: "Family",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatCurrency(row.original.amount),
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary" className="rounded-full">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due",
  },
]

export function PickupContactsTable() {
  return (
    <DataTable
      columns={pickupColumns}
      data={pickupContacts}
      filterColumn="name"
      filterPlaceholder="Filter contacts..."
    />
  )
}

export function ParentInvoicesTable() {
  return (
    <DataTable
      columns={invoiceColumns}
      data={parentInvoices}
      filterColumn="id"
      filterPlaceholder="Filter invoices..."
    />
  )
}

export function ParentDocumentsTable() {
  return (
    <DataTable
      columns={documentColumns}
      data={parentDocuments}
      filterColumn="title"
      filterPlaceholder="Filter documents..."
    />
  )
}

export function EnrollmentTable() {
  return (
    <DataTable
      columns={enrollmentColumns}
      data={enrollmentLeads}
      filterColumn="family"
      filterPlaceholder="Filter families..."
    />
  )
}

export function ChildrenTable() {
  return (
    <DataTable
      columns={childrenColumns}
      data={childrenRoster}
      filterColumn="name"
      filterPlaceholder="Filter children..."
    />
  )
}

export function StaffTable() {
  return (
    <DataTable
      columns={staffColumns}
      data={staffRoster}
      filterColumn="name"
      filterPlaceholder="Filter staff..."
    />
  )
}

export function BillingTable() {
  return (
    <DataTable
      columns={billingColumns}
      data={billingRecords}
      filterColumn="family"
      filterPlaceholder="Filter families..."
    />
  )
}
