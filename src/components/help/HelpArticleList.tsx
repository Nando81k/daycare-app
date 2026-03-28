'use client';

import { TableEmptyRow } from '@/components/ui';
import type { AdminHelpArticle } from '@/lib/help/admin-docs';
import { HelpArticleCard } from './HelpArticleCard';

interface HelpArticleListProps {
  articles: AdminHelpArticle[];
  onRegisterRef: (id: string, node: HTMLElement | null) => void;
}

export function HelpArticleList({ articles, onRegisterRef }: HelpArticleListProps) {
  if (!articles.length) {
    return (
      <div className="rounded-[22px] border border-line/80 bg-white/95 shadow-sm">
        <table className="min-w-full">
          <tbody>
            <TableEmptyRow
              colSpan={1}
              title="No matching help topics."
              description="Try a broader search or switch back to all categories."
            />
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <HelpArticleCard
          key={article.id}
          article={article}
          onRef={(node) => {
            onRegisterRef(article.id, node);
          }}
        />
      ))}
    </div>
  );
}
