"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { EmojiPicker, EmojiPickerSearch, EmojiPickerContent, EmojiPickerFooter } from "@/components/ui/emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";
import { useCallback, useState } from "react";

type EmojiPikerProps = {
    className?: string;
    onEmojiSelect?: (emoji: string) => void;
};

export default function EmojiPiker({ className, onEmojiSelect }: EmojiPikerProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleEmojiSelectInternal = useCallback(
        ({ emoji }: { emoji: string }) => {
            onEmojiSelect?.(emoji);
        },
        [onEmojiSelect]
    );

    return (
        <Popover onOpenChange={setIsOpen} open={isOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className={className} size="icon" aria-label="Emoji Picker">
                            <Smile />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-bold">Click to add emoji</p>
                </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-fit p-0">
                <EmojiPicker className="h-[342px]" onEmojiSelect={handleEmojiSelectInternal}>
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                </EmojiPicker>
            </PopoverContent>
        </Popover>
    );
}
