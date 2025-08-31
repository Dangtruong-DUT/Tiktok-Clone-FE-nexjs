"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SidebarSkeletonProps {
    className?: string;
}
export default function SidebarSkeleton({ className }: SidebarSkeletonProps) {
    return (
        <div
            className={cn(
                "relative h-screen transition-all duration-400 ease-in-out p-4 overflow-hidden",
                "w-60",
                className
            )}
        >
            {Array.from({ length: 100 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-10 mb-2" />
            ))}
        </div>
    );
}
