"use client";

import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
  items: T[];
  initialPageSize?: number;
}

export function usePagination<T>({
  items,
  initialPageSize = 20,
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    console.log('Recalculating paginatedItems:', {
      currentPage,
      pageSize,
      startIndex,
      endIndex,
      totalItems: items.length,
      itemsSlice: items.slice(startIndex, endIndex).length
    });
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    console.log('use-pagination handlePageChange called with:', page, 'Current page:', currentPage, 'Total pages:', totalPages);
    if (page >= 1 && page <= totalPages) {
      console.log('Setting currentPage to:', page);
      setCurrentPage(page);
      console.log('Page changed successfully to:', page);
    } else {
      console.log('Page change rejected - out of bounds');
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  };
}
