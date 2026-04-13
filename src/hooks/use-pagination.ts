"use client";

import { useCallback, useMemo, useState } from "react";

type UsePaginationProps = {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
};

type UsePaginationReturn = {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  paginationRange: (number | "ellipsis")[];
};

function calculatePaginationRange(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  const delta = 2;
  const range: (number | "ellipsis")[] = [];

  const rangeWithDots: (number | "ellipsis")[] = [];
  let l: number | undefined;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l !== undefined) {
      if (typeof i === "number" && i - (l as number) === 2) {
        rangeWithDots.push((l as number) + 1);
      } else if (typeof i === "number" && i - (l as number) !== 1) {
        rangeWithDots.push("ellipsis");
      }
    }
    rangeWithDots.push(i);
    l = i as number;
  }

  return rangeWithDots;
}

export function usePagination({
  totalItems,
  itemsPerPage = 10,
  initialPage = 1,
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);

  const goToPage = useCallback(
    (page: number) => {
      const pageNumber = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(pageNumber);
    },
    [totalPages],
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const paginationRange = useMemo(
    () => calculatePaginationRange(currentPage, totalPages),
    [currentPage, totalPages],
  );

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    paginationRange,
  };
}
