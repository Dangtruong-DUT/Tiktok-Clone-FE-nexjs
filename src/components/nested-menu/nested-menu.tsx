"use client";

import React, { useCallback, useState } from "react";
import DialogHeader from "@/components/dialog-header";
import NestedMenuItem from "./nested-menu-item";
import { MenuOption, MenuItem, MenuGroup, RoleType } from "./types";
import { useTranslations } from "next-intl";

export interface MenuProps {
    titleKeyI18n: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    items?: MenuOption[];
    onChange: (item: MenuOption) => void;
    onClose: () => void;
    isChecked?: (item: MenuItem) => boolean;
    onToggleChecked?: (item: MenuItem) => void;
    getTitleOfGroup: (item: MenuGroup) => string;
    for: RoleType;
}

interface MenuHistory {
    menuItems: MenuOption[];
    title?: string;
}

export default function NestedMenu({
    for: role = "guest",
    titleKeyI18n,
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

    const t = useTranslations();

    const handleItemClick = useCallback(
        (item: MenuOption) => {
            if (item.type === "group" && item.children?.items?.length) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const childTitle = t(item.children?.title || ("" as any));

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
        [onChange, t]
    );

    return (
        <div className="w-full  bg-background relative">
            {history.length === 1 ? (
                <DialogHeader title={t(titleKeyI18n)} onClose={onClose} />
            ) : (
                <DialogHeader title={current.title || ""} onBack={handleBackPrevMenu} />
            )}
            <div className="mt-7 w-full h-full overflow-y-auto flex flex-col gap-1.5">
                {current.menuItems.map((item, index) => {
                    if (!item.for.includes(role)) {
                        return null;
                    }

                    const isGroup = item.type === "group";
                    const title = isGroup ? getTitleOfGroup(item) || "" : item.title;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const translateTitle = t(title as any);

                    return (
                        <NestedMenuItem
                            key={index}
                            data={item}
                            onClick={() => handleItemClick(item)}
                            title={translateTitle}
                            isChecked={item.type === "item" && isChecked ? isChecked(item) : false}
                            onToggleChecked={item.type === "item" ? () => onToggleChecked?.(item) : undefined}
                        />
                    );
                })}
            </div>
        </div>
    );
}
