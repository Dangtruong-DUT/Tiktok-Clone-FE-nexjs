import { Skeleton } from "@/components/ui/skeleton";

export default function VideoItemSkeleton() {
    return (
        <div>
            <Skeleton className="inline-block w-full pt-[133.333%] overflow-hidden rounded-md" />
            <div className="mt-2">
                <Skeleton className="h-4 mt-2 w-[70%]" />
                <Skeleton className="h-4 mt-2 w-[90%]" />
            </div>
        </div>
    );
}
