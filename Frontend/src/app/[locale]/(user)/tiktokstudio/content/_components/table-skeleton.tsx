import { Skeleton } from "@/components/ui/skeleton";

export default function TableSkeleton() {
    return (
        <div className="w-full overflow-hidden rounded-lg border">
            <div className="min-w-full ">
                {/* Header */}
                <div className="grid grid-cols-4 px-4 py-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                </div>

                {/* Rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-4 px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                ))}
            </div>
        </div>
    );
}
