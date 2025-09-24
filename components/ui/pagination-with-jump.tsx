'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationWithJumpProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showPageInfo?: boolean;
  className?: string;
}

export function PaginationWithJump({
  currentPage,
  totalPages,
  onPageChange,
  showPageInfo = true,
  className
}: PaginationWithJumpProps) {
  const [jumpValue, setJumpValue] = useState('');
  const [showJumpInput, setShowJumpInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showJumpInput && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [showJumpInput]);

  const handleJumpSubmit = () => {
    const pageNum = parseInt(jumpValue);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setShowJumpInput(false);
      setJumpValue('');
    }
  };

  const handleJumpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpSubmit();
    } else if (e.key === 'Escape') {
      setShowJumpInput(false);
      setJumpValue('');
    }
  };

  const handleJumpClick = () => {
    setJumpValue(currentPage.toString());
    setShowJumpInput(true);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Always show last page if more than 1 page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {showPageInfo && (
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        
        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <Button
                  key={`ellipsis-${index}`}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={handleJumpClick}
                  title="Jump to page..."
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              );
            }

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Jump to Page Input */}
        {showJumpInput && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-muted-foreground">Go to:</span>
            <Input
              ref={inputRef}
              type="number"
              min="1"
              max={totalPages}
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyDown={handleJumpKeyDown}
              onBlur={() => {
                // Small delay to allow click on submit button
                setTimeout(() => setShowJumpInput(false), 150);
              }}
              className="w-16 h-8 text-center"
              placeholder="Page"
            />
            <Button
              size="sm"
              onClick={handleJumpSubmit}
              disabled={!jumpValue || parseInt(jumpValue) < 1 || parseInt(jumpValue) > totalPages}
            >
              Go
            </Button>
          </div>
        )}

        {/* Jump to Page Button (when input is not shown) */}
        {!showJumpInput && totalPages > 10 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpClick}
            className="ml-2"
            title="Jump to specific page"
          >
            Jump to...
          </Button>
        )}
        
        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}