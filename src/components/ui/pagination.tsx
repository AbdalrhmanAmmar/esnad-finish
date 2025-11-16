import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className
}) => {
  // حساب الصفحات المرئية
  const getVisiblePages = () => {
    const delta = 2; // عدد الصفحات على كل جانب من الصفحة الحالية
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();

  return (
    <div className={cn(
      "flex items-center justify-center gap-2 mt-8",
      className
    )}>
      {/* زر الصفحة السابقة */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 p-0 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* أرقام الصفحات */}
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <div
                key={`dots-${index}`}
                className="flex items-center justify-center h-9 w-9 text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </div>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className={cn(
                "h-9 w-9 p-0 transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md scale-105"
                  : "hover:bg-primary/10 hover:border-primary/20 hover:scale-105"
              )}
            >
              {pageNumber}
            </Button>
          );
        })}
      </div>

      {/* زر الصفحة التالية */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 p-0 hover:bg-primary/10 hover:border-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* معلومات الصفحة */}
      <div className="mr-4 text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full">
        صفحة {currentPage} من {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
