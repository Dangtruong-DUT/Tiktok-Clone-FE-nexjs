import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NavigationVideoSkeletonProps {
    className?: string;
}

export default function NavigationVideoSkeleton({ className }: NavigationVideoSkeletonProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center h-full w-14 gap-4 ", className)}>
            <Skeleton className=" aspect-square size-[1em]  text-[clamp(2rem,3vw+1rem,3rem)] rounded-full " />
            <Skeleton className=" aspect-square size-[1em]  text-[clamp(2rem,3vw+1rem,3rem)] rounded-full " />
        </div>
    );
}
