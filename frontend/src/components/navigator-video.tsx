import React, { memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

function NavigatorVideo() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 h-full text-[3rem]">
            <Button variant="secondary" className="rounded-full`">
                <ChevronUp />
            </Button>

            <Button variant="secondary" className="rounded-full">
                <ChevronDown />
            </Button>
        </div>
    );
}

export default memo(NavigatorVideo);
