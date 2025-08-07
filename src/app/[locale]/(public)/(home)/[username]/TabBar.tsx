import { memo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Tab {
    heading: string;
    icon: React.ReactNode;
}

interface TabBarProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabHeading: string) => void;
}

function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
    const underlineRef = useRef<HTMLDivElement>(null);

    const updateUnderline = (element: Element | null) => {
        if (element && underlineRef.current) {
            const rect = element.getBoundingClientRect();
            const parentRect = element.parentElement?.getBoundingClientRect();

            if (parentRect) {
                underlineRef.current.style.width = `${rect.width}px`;
                underlineRef.current.style.left = `${rect.left - parentRect.left}px`;
            }
        }
    };

    useEffect(() => {
        const activeTabElement = document.querySelector(`[data-key="${activeTab}"]`);
        updateUnderline(activeTabElement);
    }, [activeTab, tabs]);

    const handleMouseEnter = (tab: Tab) => {
        const hoveredTabElement = document.querySelector(`[data-key="${tab.heading}"]`);
        updateUnderline(hoveredTabElement);
    };

    const handleMouseLeave = () => {
        const activeTabElement = document.querySelector(`[data-key="${activeTab}"]`);
        updateUnderline(activeTabElement);
    };

    return (
        <div className="flex flex-row relative">
            <ul className="flex flex-row flex-grow border-b border-[var(--header-boxShadow-cl)] max-md:justify-center">
                {tabs.map((tab) => (
                    <li
                        key={tab.heading}
                        data-key={tab.heading}
                        className={cn(
                            "font-semibold text-[1.8rem] leading-[1.334] flex items-center justify-center h-11 px-8 cursor-pointer text-center gap-1 text-[var(--secondary-text-cl)] transition-colors duration-200 hover:text-gray-500",
                            "max-md:px-4 max-md:flex-grow",
                            {
                                "text-[var(--primary-text-cl)]": tab.heading === activeTab,
                            }
                        )}
                        onClick={() => onTabChange(tab.heading)}
                        onMouseEnter={() => handleMouseEnter(tab)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="flex justify-center items-center">{tab.icon}</span>
                        <span>{tab.heading}</span>
                    </li>
                ))}
                <div
                    ref={underlineRef}
                    className="absolute h-0.5 bg-[var(--primary-text-cl)] bottom-0 transition-all duration-300 ease-in-out"
                />
            </ul>
        </div>
    );
}

export default memo(TabBar);
