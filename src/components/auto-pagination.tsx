import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    page: number;
    pageSize: number;
    pathname?: string;
    onPageChange?: (page: number) => void; // optional callback when using Button
}

const RANGE = 2;

export default function AutoPagination({ page, pageSize, pathname, onPageChange }: Props) {
    const isLinkMode = !!pathname;

    const handleClick = (targetPage: number) => {
        if (!isLinkMode && onPageChange) {
            onPageChange(targetPage);
        }
    };

    const renderPageItem = (pageNumber: number) => {
        const isActive = pageNumber === page;
        return (
            <PaginationItem key={pageNumber}>
                {isLinkMode ? (
                    <PaginationLink
                        href={{
                            pathname,
                            query: { page: pageNumber },
                        }}
                        isActive={isActive}
                    >
                        {pageNumber}
                    </PaginationLink>
                ) : (
                    <Button variant={isActive ? "outline" : "ghost"} onClick={() => handleClick(pageNumber)}>
                        {pageNumber}
                    </Button>
                )}
            </PaginationItem>
        );
    };

    const renderPaginationItems = () => {
        let dotAfter = false;
        let dotBefore = false;

        return Array.from({ length: pageSize }).map((_, index) => {
            const pageNumber = index + 1;

            const showDotAfter = () =>
                !dotAfter &&
                ((page <= RANGE * 2 + 1 && pageNumber > page + RANGE && pageNumber < pageSize - RANGE + 1) ||
                    (page > RANGE * 2 + 1 &&
                        page < pageSize - RANGE * 2 &&
                        pageNumber > page + RANGE &&
                        pageNumber < pageSize - RANGE + 1));

            const showDotBefore = () =>
                !dotBefore &&
                ((page > RANGE * 2 + 1 &&
                    page < pageSize - RANGE * 2 &&
                    pageNumber < page - RANGE &&
                    pageNumber > RANGE) ||
                    (page >= pageSize - RANGE * 2 && pageNumber > RANGE && pageNumber < page - RANGE));

            if (showDotAfter()) {
                dotAfter = true;
                return (
                    <PaginationItem key={`after-${index}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            if (showDotBefore()) {
                dotBefore = true;
                return (
                    <PaginationItem key={`before-${index}`}>
                        <PaginationEllipsis />
                    </PaginationItem>
                );
            }

            return renderPageItem(pageNumber);
        });
    };

    const renderPrev = () => (
        <PaginationItem>
            {isLinkMode ? (
                <PaginationPrevious
                    href={{
                        pathname,
                        query: { page: page === 1 ? page : page - 1 },
                    }}
                    className={cn({ "cursor-not-allowed": page === 1 })}
                    onClick={(e) => page === 1 && e.preventDefault()}
                />
            ) : (
                <Button
                    variant="ghost"
                    className={cn({ "cursor-not-allowed": page === 1 })}
                    onClick={() => page > 1 && handleClick(page - 1)}
                >
                    <ChevronLeft /> Previous
                </Button>
            )}
        </PaginationItem>
    );

    const renderNext = () => (
        <PaginationItem>
            {isLinkMode ? (
                <PaginationNext
                    href={{
                        pathname,
                        query: { page: page === pageSize ? page : page + 1 },
                    }}
                    className={cn({ "cursor-not-allowed": page === pageSize })}
                    onClick={(e) => page === pageSize && e.preventDefault()}
                />
            ) : (
                <Button
                    variant="ghost"
                    className={cn("text-sm font-medium", { "cursor-not-allowed": page === pageSize })}
                    onClick={() => page < pageSize && handleClick(page + 1)}
                >
                    Next
                    <ChevronRight />
                </Button>
            )}
        </PaginationItem>
    );

    return (
        <Pagination>
            <PaginationContent>
                {renderPrev()}
                {renderPaginationItems()}
                {renderNext()}
            </PaginationContent>
        </Pagination>
    );
}
