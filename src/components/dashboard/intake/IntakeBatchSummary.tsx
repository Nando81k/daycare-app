'use client';

import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

export type IntakeSubmissionMode = 'ADD_ONLY' | 'ENROLL_ONLY' | 'COMBINED';

export function IntakeBatchSummary(props: {
  mode: IntakeSubmissionMode;
  selectedChildren: number;
  profileCount: number;
  enrollmentCount: number;
  hasUploads: boolean;
  fullScreen?: boolean;
}) {
  const modeLabel =
    props.mode === 'ADD_ONLY'
      ? 'Child profiles only'
      : props.mode === 'ENROLL_ONLY'
        ? 'Enrollment only'
        : 'Combined intake';
  const modeDescription =
    props.mode === 'ADD_ONLY'
      ? 'Profiles will be saved for later enrollment.'
      : props.mode === 'ENROLL_ONLY'
        ? 'Enrollment requests will be sent for new children in this intake batch.'
        : 'Profile updates and enrollment requests will be submitted together.';

  return (
    <div
      className={cn(
        'rounded-[12px] border border-slate-200/80 bg-white/90 p-4 shadow-soft',
        props.fullScreen && 'intake-v3-step-panel'
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info" className="rounded-[8px] px-2.5 py-1 text-[11px] normal-case tracking-normal">
          {modeLabel}
        </Badge>
        {props.hasUploads ? (
          <Badge variant="default" className="rounded-[8px] px-2.5 py-1 text-[11px] normal-case tracking-normal">
            Photo upload included
          </Badge>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-ink-700">{modeDescription}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[10px] border border-slate-200/80 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.08em] text-ink-500">Selected children</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">{props.selectedChildren}</p>
        </div>
        <div className="rounded-[10px] border border-slate-200/80 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.08em] text-ink-500">Profile updates</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">{props.profileCount}</p>
        </div>
        <div className="rounded-[10px] border border-slate-200/80 bg-white px-3 py-2">
          <p className="text-xs uppercase tracking-[0.08em] text-ink-500">Enrollment requests</p>
          <p className="mt-1 text-lg font-semibold text-ink-900">{props.enrollmentCount}</p>
        </div>
      </div>
    </div>
  );
}
