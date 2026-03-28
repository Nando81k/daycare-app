'use client';

import Link from 'next/link';
import { ArrowUpRight, CircleAlert, Lightbulb } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import {
  ADMIN_HELP_CATEGORY_LABELS,
  type AdminHelpArticle,
} from '@/lib/help/admin-docs';

interface HelpArticleCardProps {
  article: AdminHelpArticle;
  onRef?: (node: HTMLElement | null) => void;
}

export function HelpArticleCard({ article, onRef }: HelpArticleCardProps) {
  return (
    <article
      id={article.id}
      ref={onRef}
      className="scroll-mt-24 rounded-[22px] border border-line/80 bg-white/95 p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <Badge variant="info">{ADMIN_HELP_CATEGORY_LABELS[article.category]}</Badge>
          <h2 tabIndex={-1} data-article-heading className="mt-3 text-[1.35rem] font-semibold text-ink-900">
            {article.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{article.summary}</p>
        </div>
        {article.route ? (
          <Button asChild variant="outline" size="sm" className="px-4">
            <Link href={article.route}>
              Open page
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3">
        {article.steps.map((step, index) => (
          <div key={`${article.id}-${step.title}`} className="rounded-[16px] border border-line/70 bg-bg-soft/65 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-900 text-xs font-semibold text-white">
                {index + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink-900">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-700">{step.body}</p>
                {step.route ? (
                  <p className="mt-2 text-xs font-medium text-ink-500">
                    Use this on <span className="text-ink-800">{step.route}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {article.notes?.length ? (
        <div className="mt-5 rounded-[18px] border border-sky-200 bg-sky-50/75 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-sky-900">
            <Lightbulb className="h-4 w-4" />
            Helpful notes
          </p>
          <ul className="mt-2 space-y-2 text-sm text-sky-900/90">
            {article.notes.map((note) => (
              <li key={note} className="leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {article.troubleshooting?.length ? (
        <div className="mt-4 rounded-[18px] border border-amber-200 bg-amber-50/80 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
            <CircleAlert className="h-4 w-4" />
            Troubleshooting
          </p>
          <ul className="mt-2 space-y-2 text-sm text-amber-900/90">
            {article.troubleshooting.map((item) => (
              <li key={item} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
