import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

type NavigationVideoProps = {
    className?: string;
};

export default function NavigationVideo({ className }: NavigationVideoProps) {
    return (
        <div className={cn(className, "flex flex-col")}>
            <Button
                variant="secondary"
                size="icon"
                className={cn(
                    "rounded-t-full cursor-pointer bg-black/15 py-5 pb-7 text-white [&>svg]:size-6",
                    "hover:bg-accent/80",
                    "disabled:bg-black/10 disabled:text-white/50 disabled:cursor-not-allowed disabled:hover:bg-black/10"
                )}
            >
                <ChevronUp />
            </Button>
            <Button
                variant="secondary"
                size="icon"
                className={cn(
                    "rounded-b-full cursor-pointer bg-black/15 py-5 pt-7 text-white [&>svg]:size-6",
                    "hover:bg-accent/15 ",
                    "disabled:bg-black/10 disabled:text-white/50 disabled:cursor-not-allowed disabled:hover:bg-black/10"
                )}
            >
                <ChevronDown />
            </Button>
        </div>
    );
}
