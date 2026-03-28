'use client';

import { useState } from 'react';
import { BillingPolicyForm } from '@/components/admin/BillingPolicyForm';
import { TuitionPlansManager } from '@/components/admin/TuitionPlansManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';

interface BillingPolicy {
  graceDays: number;
  lateFeeCents: number;
  pauseAfterDaysPastDue: number;
  reminderOffsets: number[];
  holdHours: number;
}

interface TuitionPlan {
  id: string;
  name: string;
  programType: 'INFANT' | 'TODDLER' | 'PRESCHOOL' | 'PRE_K' | null;
  monthlyAmountCents: number;
  registrationFeeCents: number;
  allowMonthly: boolean;
  allowBiweekly: boolean;
  allowWeekly: boolean;
  isActive: boolean;
}

interface BillingControlPanelProps {
  policy: BillingPolicy | null;
  plans: TuitionPlan[];
}

export function BillingControlPanel({ policy, plans }: BillingControlPanelProps) {
  const [tab, setTab] = useState<'pricing' | 'policy'>('pricing');

  return (
    <div className="space-y-3">
      <Tabs value={tab} onValueChange={(value) => setTab(value as 'pricing' | 'policy')}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pricing">Class Pricing</TabsTrigger>
          <TabsTrigger value="policy">Collections Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="pt-1">
          <TuitionPlansManager initialPlans={plans} />
        </TabsContent>

        <TabsContent value="policy" className="pt-1">
          {policy ? (
            <BillingPolicyForm policy={policy} />
          ) : (
            <p className="rounded-field border border-line bg-bg-soft px-3 py-3 text-sm text-ink-600">
              Billing policy is missing. Create the policy to control grace window, late fee, and reminders.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
