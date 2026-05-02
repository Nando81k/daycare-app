"use client"

import { useActionState, useState } from "react"
import { Receipt } from "lucide-react"

import { createInvoice } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { initialMutationState } from "@/lib/action-state"
import { toMinorUnits } from "@/lib/format"
import type { AdminActionState } from "@/types/app"
import type { AdminBillingFamilyOption } from "@/lib/dal/admin-billing"

const FEE_PRESETS = [
  { label: "Registration fee", description: "Registration fee", amount: 25000 },
  { label: "Materials fee", description: "Materials fee", amount: 12000 },
  { label: "Late fee", description: "Late payment fee", amount: 5000 },
] as const

export function AdminCreateInvoiceForm({
  families,
}: {
  families: AdminBillingFamilyOption[]
}) {
  const [state, action, isPending] = useActionState<AdminActionState, FormData>(
    createInvoice,
    initialMutationState
  )

  const [amountNaira, setAmountNaira] = useState("")
  const [description, setDescription] = useState("")
  const [familyId, setFamilyId] = useState<string>("")

  function applyPreset(preset: (typeof FEE_PRESETS)[number]) {
    setDescription(preset.description)
    setAmountNaira(String(preset.amount))
  }

  const amountCents = amountNaira ? toMinorUnits(Number(amountNaira)) : 0

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="familyId" value={familyId} />
      <input type="hidden" name="amountCents" value={amountCents} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="family">Family</Label>
          <Select value={familyId} onValueChange={setFamilyId}>
            <SelectTrigger id="family">
              <SelectValue placeholder="Choose a family…" />
            </SelectTrigger>
            <SelectContent>
              {families.map((family) => (
                <SelectItem key={family.id} value={family.id}>
                  <span className="flex items-center justify-between gap-3">
                    {family.name}
                    {family.outstandingCents > 0 && (
                      <span className="text-xs text-amber-700">
                        {family.outstandingLabel} outstanding
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="May tuition, registration fee, etc."
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount (NGN)</Label>
          <Input
            id="amount"
            inputMode="decimal"
            value={amountNaira}
            onChange={(e) => setAmountNaira(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" name="dueDate" type="date" required />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Quick presets
        </span>
        {FEE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted/30"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <Button
        type="submit"
        disabled={isPending || !familyId}
        className="w-full justify-center"
      >
        <Receipt className="h-4 w-4" />
        {isPending ? "Creating…" : "Create invoice (draft)"}
      </Button>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700"
          role="status"
          aria-live="polite"
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
