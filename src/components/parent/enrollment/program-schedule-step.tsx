"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { EnrollmentPricingOptions } from "@/lib/pricing"
import type { ParentEnrollmentApplicationDraft } from "@/types/app"

import { Field, FieldsGrid, fieldClasses } from "./step-fields"

export type ProgramScheduleStepProps = {
  draft: ParentEnrollmentApplicationDraft
  onChange: (patch: Partial<ParentEnrollmentApplicationDraft>) => void
  options: EnrollmentPricingOptions
}

export function ProgramScheduleStep({
  draft,
  onChange,
  options,
}: ProgramScheduleStepProps) {
  const { programs, schedules } = options
  const hasPrograms = programs.length > 0
  const hasSchedules = schedules.length > 0

  return (
    <div className="space-y-5">
      <FieldsGrid>
        <Field label="Program" htmlFor="program">
          <Select
            value={draft.programInterest}
            onValueChange={(v) => onChange({ programInterest: v })}
            disabled={!hasPrograms}
          >
            <SelectTrigger id="program" className={fieldClasses}>
              <SelectValue
                placeholder={
                  hasPrograms ? "Choose a program…" : "No programs configured"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.slug}>
                  <div className="flex flex-col">
                    <span className="font-medium">{program.name}</span>
                    {program.ageRange && (
                      <span className="text-xs text-slate-500">
                        {program.ageRange}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Schedule" htmlFor="schedule">
          <Select
            value={draft.scheduleNeed}
            onValueChange={(v) =>
              onChange({ scheduleNeed: v, requestedStart: draft.requestedStart })
            }
            disabled={!hasSchedules}
          >
            <SelectTrigger id="schedule" className={fieldClasses}>
              <SelectValue
                placeholder={
                  hasSchedules ? "Choose a schedule…" : "No schedules configured"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {schedules.map((schedule) => (
                <SelectItem key={schedule.id} value={schedule.slug}>
                  <div className="flex flex-col">
                    <span className="font-medium">{schedule.name}</span>
                    {schedule.daysDescription && (
                      <span className="text-xs text-slate-500">
                        {schedule.daysDescription}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </FieldsGrid>

      <Field label="Desired start date" htmlFor="start-date">
        <Input
          id="start-date"
          type="date"
          className={fieldClasses}
          value={draft.preferredStartDate}
          onChange={(e) =>
            onChange({
              preferredStartDate: e.target.value,
              requestedStart: e.target.value,
            })
          }
        />
      </Field>

      <Field label="Schedule notes" htmlFor="schedule-notes" optional>
        <Textarea
          id="schedule-notes"
          placeholder="Any special schedule requests or notes…"
          className={fieldClasses}
          value={draft.note}
          onChange={(e) => onChange({ note: e.target.value })}
        />
      </Field>
    </div>
  )
}
