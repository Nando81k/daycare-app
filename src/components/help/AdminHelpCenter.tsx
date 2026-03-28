'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminRole, OnboardingStatus } from '@prisma/client';
import { ArrowLeft, ArrowUpRight, BookOpenText } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import {
  ADMIN_HELP_CATEGORY_LABELS,
  type AdminHelpArticle,
  type AdminHelpCategory,
} from '@/lib/help/admin-docs';
import { HelpArticleList } from './HelpArticleList';
import { HelpQuickActions } from './HelpQuickActions';
import { HelpSearchInput } from './HelpSearchInput';
import { HelpToc } from './HelpToc';

interface AdminHelpCenterProps {
  adminRole: AdminRole | null;
  articles: AdminHelpArticle[];
  tutorialStatus: OnboardingStatus;
}

function matchesQuery(article: AdminHelpArticle, query: string) {
  const haystack = [
    article.title,
    article.summary,
    article.category,
    ...article.keywords,
    ...article.steps.flatMap((step) => [step.title, step.body, step.route || '', step.anchorId || '']),
    ...(article.notes ?? []),
    ...(article.troubleshooting ?? []),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function roleLabel(role: AdminRole | null) {
  if (!role) return 'Admin';
  return role.replace('_', ' ');
}

export function AdminHelpCenter({ adminRole, articles, tutorialStatus }: AdminHelpCenterProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AdminHelpCategory | 'ALL'>('ALL');
  const [activeArticleId, setActiveArticleId] = useState<string | null>(articles[0]?.id ?? null);
  const articleRefs = useRef<Record<string, HTMLElement | null>>({});

  const articleMap = useMemo(() => new Map(articles.map((article) => [article.id, article])), [articles]);

  const categories = useMemo(() => {
    const counts = new Map<AdminHelpCategory, number>();
    for (const article of articles) {
      counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map(([key, count]) => ({ key, count }));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const categoryMatches = category === 'ALL' || article.category === category;
      const queryMatches = !query.trim() || matchesQuery(article, query.trim());
      return categoryMatches && queryMatches;
    });
  }, [articles, category, query]);

  const activeArticle = useMemo(() => {
    if (!filteredArticles.length) return null;
    return filteredArticles.find((article) => article.id === activeArticleId) ?? filteredArticles[0];
  }, [activeArticleId, filteredArticles]);

  useEffect(() => {
    if (!filteredArticles.length) {
      setActiveArticleId(null);
      return;
    }

    if (!activeArticle || !filteredArticles.some((article) => article.id === activeArticle.id)) {
      setActiveArticleId(filteredArticles[0].id);
    }
  }, [activeArticle, filteredArticles]);

  function focusArticle(id: string) {
    const section = articleRefs.current[id];
    if (!section) {
      setActiveArticleId(id);
      return;
    }

    setActiveArticleId(id);
    window.history.replaceState(null, '', `#${id}`);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    const heading = section.querySelector<HTMLElement>('[data-article-heading]');
    window.setTimeout(() => {
      heading?.focus();
    }, 120);
  }

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    if (!articleMap.has(hash)) return;

    const timer = window.setTimeout(() => {
      focusArticle(hash);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [articleMap]);

  return (
    <div className="space-y-5">
      <Card
        title="Admin Help Center"
        subtitle="Search the exact workflow you need, then launch the matching admin page or guided tutorial."
        className="glass-shell"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <Badge variant="info">Showing guidance for {roleLabel(adminRole)}</Badge>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">
              This help center documents the current admin suite as it exists today. Use it for operational steps,
              role-specific guidance, and links back into the exact queue or workspace you need.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4" />
                Back to Overview
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/admissions">
                Open Admissions
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <HelpQuickActions
        tutorialStatus={tutorialStatus}
        articleMap={articleMap}
        onSelectArticle={focusArticle}
        adminRole={adminRole}
      />

      <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_18rem]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card
            title="Find a topic"
            subtitle="Search tasks, pages, and problem states."
            className="glass-shell"
          >
            <HelpSearchInput value={query} onChange={setQuery} />
            <p className="mt-2 text-xs text-ink-500">
              Search works across article titles, workflow steps, keywords, and troubleshooting notes.
            </p>
          </Card>

          <HelpToc
            categories={categories}
            activeCategory={category}
            onCategoryChange={setCategory}
            articles={filteredArticles}
            activeArticleId={activeArticle?.id ?? null}
            onSelectArticle={focusArticle}
          />
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="default">{filteredArticles.length} topics</Badge>
            <Badge variant="info">
              {category === 'ALL' ? 'All categories' : ADMIN_HELP_CATEGORY_LABELS[category]}
            </Badge>
            {query.trim() ? <Badge variant="warning">Search: {query.trim()}</Badge> : null}
          </div>

          <HelpArticleList
            articles={filteredArticles}
            onRegisterRef={(id, node) => {
              articleRefs.current[id] = node;
            }}
          />
        </main>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card
            title="Current topic"
            subtitle="Open the related page or jump to another workflow."
            className="glass-shell"
          >
            {activeArticle ? (
              <div className="space-y-3">
                <div>
                  <Badge variant="info">{ADMIN_HELP_CATEGORY_LABELS[activeArticle.category]}</Badge>
                  <p className="mt-2 text-sm font-semibold text-ink-900">{activeArticle.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{activeArticle.summary}</p>
                </div>
                {activeArticle.route ? (
                  <Button asChild variant="outline" size="sm" className="w-full justify-between">
                    <Link href={activeArticle.route}>
                      Open related page
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-ink-600">Select a topic to see the related admin page and connected documentation.</p>
            )}
          </Card>

          <Card title="Related topics" subtitle="Next steps from the current article." className="glass-shell">
            {activeArticle?.relatedIds?.length ? (
              <div className="space-y-2">
                {activeArticle.relatedIds
                  .map((id) => articleMap.get(id))
                  .filter((article): article is AdminHelpArticle => Boolean(article))
                  .map((article) => (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => focusArticle(article.id)}
                      className="w-full rounded-[14px] border border-line/80 bg-white/92 px-3 py-3 text-left transition hover:border-sky-300/60 hover:bg-sky-50/55"
                    >
                      <p className="text-sm font-semibold text-ink-900">{article.title}</p>
                      <p className="mt-1 text-xs text-ink-500">{article.summary}</p>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="rounded-[14px] border border-line/80 bg-white/92 px-3 py-3 text-sm text-ink-600">
                Related workflow links will appear here when a topic has connected guidance.
              </div>
            )}
          </Card>

          <Card title="How to use Help" subtitle="Best way to work with this page." className="glass-shell">
            <div className="space-y-3 text-sm text-ink-700">
              <p className="inline-flex items-start gap-2">
                <BookOpenText className="mt-0.5 h-4 w-4 shrink-0 text-ink-500" />
                Search first when you already know the task you want to complete.
              </p>
              <p>Use the category filters when you want to stay inside one workflow like Admissions or Billing.</p>
              <p>Open the related page once you know the next action and return here if you need more context.</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
