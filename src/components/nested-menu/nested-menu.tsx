"use client";

import React, { useCallback, useState } from "react";
import DialogHeader from "@/components/dialog-header";
import NestedMenuItem from "./nested-menu-item";
import { MenuOption, MenuItem, MenuGroup } from "./types";

export interface MenuProps {
    title: string;
    items?: MenuOption[];
    onChange: (item: MenuOption) => void;
    onClose: () => void;
    isChecked?: (item: MenuItem) => boolean;
    onToggleChecked?: (item: MenuItem) => void;
    getTitleOfGroup: (item: MenuGroup) => string;
}

interface MenuHistory {
    menuItems: MenuOption[];
    title?: string;
}

export default function NestedMenu({
    title,
    items,
    onChange,
    onClose,
    isChecked,
    onToggleChecked,
    getTitleOfGroup,
}: MenuProps) {
    const [history, setHistory] = useState<MenuHistory[]>([{ menuItems: items || [] }]);
    const current = history[history.length - 1];

    const handleBackPrevMenu = useCallback(() => {
        setHistory((prev) => prev.slice(0, -1));
    }, []);

    const handleItemClick = useCallback(
        (item: MenuOption) => {
            if (item.type === "group" && item.children?.items?.length) {
                const childTitle = item.children?.title || "";
                setHistory((prev) => [
                    ...prev,
                    {
                        menuItems: item.children.items,
                        title: childTitle,
                    },
                ]);
            } else {
                onChange(item);
            }
        },
        [onChange]
    );

    return (
        <div className="w-full bg-background relative">
            {history.length === 1 ? (
                <DialogHeader title={title} onClose={onClose} />
            ) : (
                <DialogHeader title={current.title || ""} onBack={handleBackPrevMenu} />
            )}
            <div className="mt-7 overflow-y-auto">
                {current.menuItems.map((item, index) => {
                    const isGroup = item.type === "group";
                    const title = isGroup ? getTitleOfGroup(item) || "" : item.title;
                    return (
                        <NestedMenuItem
                            key={index}
                            data={item}
                            onClick={() => handleItemClick(item)}
                            title={title}
                            isChecked={item.type === "item" && isChecked ? isChecked(item) : false}
                            onToggleChecked={item.type === "item" ? () => onToggleChecked?.(item) : undefined}
                        />
                    );
                })}
            </div>
        </div>
    );
}
