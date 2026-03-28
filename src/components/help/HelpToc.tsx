'use client';

import { Badge, Button } from '@/components/ui';
import {
  ADMIN_HELP_CATEGORY_LABELS,
  type AdminHelpArticle,
  type AdminHelpCategory,
} from '@/lib/help/admin-docs';
import { cn } from '@/lib/utils';

interface HelpTocProps {
  categories: Array<{ key: AdminHelpCategory; count: number }>;
  activeCategory: AdminHelpCategory | 'ALL';
  onCategoryChange: (value: AdminHelpCategory | 'ALL') => void;
  articles: AdminHelpArticle[];
  activeArticleId: string | null;
  onSelectArticle: (id: string) => void;
}

export function HelpToc({
  categories,
  activeCategory,
  onCategoryChange,
  articles,
  activeArticleId,
  onSelectArticle,
}: HelpTocProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-[18px] border border-line/80 bg-white/92 p-3 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Categories</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant={activeCategory === 'ALL' ? 'primary' : 'outline'}
            size="sm"
            className="px-3"
            onClick={() => onCategoryChange('ALL')}
          >
            All topics
          </Button>
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={activeCategory === category.key ? 'primary' : 'outline'}
              size="sm"
              className="px-3"
              onClick={() => onCategoryChange(category.key)}
            >
              {ADMIN_HELP_CATEGORY_LABELS[category.key]}
              <Badge variant={activeCategory === category.key ? 'default' : 'info'} className="ml-1.5">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-[18px] border border-line/80 bg-white/92 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Contents</p>
          <Badge variant="info">{articles.length}</Badge>
        </div>
        <nav className="mt-3 space-y-1.5">
          {articles.map((article) => (
            <button
              key={article.id}
              type="button"
              onClick={() => onSelectArticle(article.id)}
              className={cn(
                'w-full rounded-[12px] border px-3 py-2 text-left transition',
                activeArticleId === article.id
                  ? 'border-sky-300 bg-sky-50 text-sky-950 shadow-sm'
                  : 'border-transparent bg-white text-ink-700 hover:border-line hover:bg-bg-soft',
              )}
            >
              <p className="text-sm font-semibold">{article.title}</p>
              <p className="mt-1 text-xs text-ink-500">{ADMIN_HELP_CATEGORY_LABELS[article.category]}</p>
            </button>
          ))}
        </nav>
      </section>
    </div>
  );
}
