"use client"

import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const requiredItems = [
  "Birth certificate or proof of age",
  "Immunization records (up-to-date)",
  "Two forms of guardian ID",
  "Emergency contact information",
  "Physician / pediatrician info",
  "Signed enrollment agreement",
]

export function DocumentsStep() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">
          Required documents
        </p>
        <p className="text-sm text-slate-500">
          Upload these now or attach them later from your portal — your
          application can be submitted either way.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {requiredItems.map((item) => (
            <label
              key={item}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white/70 p-3 text-sm text-slate-600"
            >
              <Checkbox />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-700">Upload documents</p>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-white/60 p-8 text-center">
          <Upload className="h-8 w-8 text-slate-400" />
          <p className="text-sm text-slate-500">
            Drag &amp; drop files here, or click to browse
          </p>
          <p className="text-xs text-slate-400">
            PDF, JPG, PNG up to 10 MB each
          </p>
          <Button variant="outline" size="sm" className="mt-1" type="button">
            Browse files
          </Button>
        </div>
        <p className="text-xs text-slate-400">
          Document uploads connect to your portal after the application is
          submitted.
        </p>
      </div>
    </div>
  )
}
