'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';

interface Point {
  status: string;
  count: number;
}

const COLORS: Record<string, string> = {
  PAID: '#0b9a74',
  OPEN: '#1f74f0',
  PAST_DUE: '#cf4061',
  DRAFT: '#4f87bd',
  VOID: '#c4d9ec',
};

export function CollectionsStatusChart({ data }: { data: Point[] }) {
  return (
    <ChartCard
      title="Collections Mix"
      subtitle="Invoice status distribution"
      info={{
        label: 'Collections mix help',
        title: 'How to interpret invoice mix',
        description: (
          <ul className="space-y-1">
            <li>`PAID` indicates completed collections.</li>
            <li>`OPEN` and `PAST_DUE` represent current receivables risk.</li>
            <li>Use together with trend chart to spot collection pressure.</li>
          </ul>
        ),
      }}
    >
      <div className="grid h-full min-h-0 min-w-0 gap-3 lg:grid-cols-[1fr_140px]">
        <div className="h-full min-h-0 min-w-0 overflow-hidden rounded-field border border-line/70 bg-white/70 p-1.5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="status" innerRadius={64} outerRadius={96}>
                {data.map((entry) => (
                  <Cell key={entry.status} fill={COLORS[entry.status] || '#5f89b3'} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => Number(value)} contentStyle={{ borderRadius: 12, border: '1px solid #adc8e8', background: '#ffffff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 space-y-2 overflow-hidden rounded-field border border-line bg-white p-2.5">
          {data.map((entry) => (
            <div key={entry.status} className="flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 text-ink-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[entry.status] || '#5f89b3' }} />
                {entry.status.replace('_', ' ')}
              </span>
              <span className="font-semibold text-ink-900">{entry.count}</span>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}
