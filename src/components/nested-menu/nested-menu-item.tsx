import React, { useCallback } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuOption } from "@/components/nested-menu/types";
import { Link } from "@/i18n/navigation";
import { on } from "events";

export interface MenuItemProps {
    data: MenuOption;
    onClick?: () => void;
    isChecked?: boolean;
    onToggleChecked?: () => void;
    title: string;
}

export default function NestedMenuItem({ data, onClick, isChecked, onToggleChecked, title }: MenuItemProps) {
    const baseClass =
        "items-center justify-between w-full ml-0 whitespace-nowrap px-2.5 py-2.5 " +
        "text-foreground font-semibold text-base rounded-[5px] tracking-[0.15px] hover:bg-accent cursor-pointer transition-colors";

    const handleClick = useCallback(() => {
        onClick?.();
        onToggleChecked?.();
    }, [onClick, onToggleChecked]);

    if (data.type === "group") {
        return (
            <Button variant="ghost" className={baseClass} onClick={handleClick}>
                <div className="flex items-center gap-3">
                    <span>{title}</span>
                </div>
                <ChevronRight size={16} className="text-muted-foreground" />
            </Button>
        );
    }

    if (data.to) {
        return (
            <Link href={data.to} className={baseClass} onClick={handleClick}>
                <div className="flex items-center gap-3">
                    <span>{title}</span>
                    {isChecked && <Check size={16} className="text-muted-foreground" />}
                </div>
            </Link>
        );
    }

    return (
        <Button variant="ghost" className={baseClass} onClick={handleClick}>
            <div className="flex items-center gap-3">
                <span>{title}</span>
                {isChecked && <Check size={16} className="text-muted-foreground" />}
            </div>
        </Button>
    );
}
