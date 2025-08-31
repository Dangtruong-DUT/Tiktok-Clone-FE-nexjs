import { Skeleton } from "@/components/ui/skeleton";

export default function AccountItemSkeleton() {
    return (
        <div className="flex space-x-2 w-full justify-start items-center py-[9px] min-h-[97px]">
            <Skeleton className="size-15 rounded-full" />
            <div className="space-y-1.5">
                <Skeleton className="h-4 w-[177px]" />
                <Skeleton className="h-4  w-[250px]" />
            </div>
        </div>
    );
}
