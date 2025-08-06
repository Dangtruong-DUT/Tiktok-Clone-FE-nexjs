"use client";

import { memo, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ID_TAB_ITEMS, TabItemType } from "@/app/[locale]/(public)/(home)/[username]/_config/tab-items.config";

interface TabBarProps {
    tabs: TabItemType[];
    activeTabID: ID_TAB_ITEMS;
    onTabChange: (tabHeading: ID_TAB_ITEMS) => void;
}

function TabBar({ tabs, activeTabID, onTabChange }: TabBarProps) {
    const underlineRef = useRef<HTMLDivElement>(null);

    const updateUnderline = useCallback((element: Element | null) => {
        if (element && underlineRef.current) {
            const rect = element.getBoundingClientRect();
            const parentRect = element.parentElement?.getBoundingClientRect();

            if (parentRect) {
                underlineRef.current.style.width = `${rect.width}px`;
                underlineRef.current.style.left = `${rect.left - parentRect.left}px`;
            }
        }
    }, []);

    useEffect(() => {
        const activeTabElement = document.querySelector(`[data-key="${activeTabID}"]`);
        updateUnderline(activeTabElement);
    }, [activeTabID, tabs, updateUnderline]);

    const handleMouseEnter = useCallback(
        (tab: TabItemType) => {
            const hoveredTabElement = document.querySelector(`[data-key="${tab.id}"]`);
            updateUnderline(hoveredTabElement);
        },
        [updateUnderline]
    );

    const handleMouseLeave = useCallback(() => {
        const activeTabElement = document.querySelector(`[data-key="${activeTabID}"]`);
        updateUnderline(activeTabElement);
    }, [activeTabID, updateUnderline]);

    return (
        <div className="flex flex-row relative">
            <ul className="flex flex-row flex-grow border-b border-border max-md:justify-center">
                {tabs.map((tab) => (
                    <li
                        key={tab.id}
                        data-key={tab.id}
                        className={cn(
                            "font-semibold text-lg  flex items-center justify-center h-11 px-8 cursor-pointer text-center gap-1 text-muted-foreground   transition-colors duration-200 hover:text-gray-500",
                            "max-md:px-4 max-md:flex-grow",
                            {
                                "text-foreground": tab.id === activeTabID,
                            }
                        )}
                        onClick={() => onTabChange(tab.id)}
                        onMouseEnter={() => handleMouseEnter(tab)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="flex justify-center items-center [&_svg]:size-5">{tab.icon}</span>
                        <span>{tab.heading}</span>
                    </li>
                ))}
                <div
                    ref={underlineRef}
                    className="absolute h-0.5 bg-foreground bottom-0 transition-all duration-300 ease-in-out"
                />
            </ul>
        </div>
    );
}

export default memo(TabBar);
