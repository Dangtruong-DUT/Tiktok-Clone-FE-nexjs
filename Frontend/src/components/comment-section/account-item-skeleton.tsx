import { Skeleton } from "@/components/ui/skeleton";

export default function AccountItemSkeleton() {
    return (
        <div className="flex space-x-2 w-full justify-start items-center py-1">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5">
                <Skeleton className="h-4 w-[177px]" />
                <Skeleton className="h-4  w-[250px]" />
            </div>
        </div>
    );
}
