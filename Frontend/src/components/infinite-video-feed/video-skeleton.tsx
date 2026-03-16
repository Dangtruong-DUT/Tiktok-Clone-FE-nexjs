import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VideoWithActionSkeletonProps {
    className?: string;
}

export default function VideoWithActionSkeleton({ className }: VideoWithActionSkeletonProps) {
    return (
        <div className={cn("px-4 @5xl:ps-[3rem] @5xl:pe-[15rem]  py-4 min-h-screen", className)}>
            <div className="flex flex-row items-end justify-center space-x-4 mx-auto">
                <Skeleton className=" w-full h-full sm:max-w-[400px] aspect-[9/16] rounded-2xl" />
                <div className="flex flex-col items-center gap-6 mt-4">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Skeleton key={index} className="text-5xl size-[1em] rounded-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}
