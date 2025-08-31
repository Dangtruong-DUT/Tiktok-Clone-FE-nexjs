import { TAB_ITEMS, TabbarItemsId } from "@/app/[locale]/(public)/(home)/search/_config/tabbar-items";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface HeaderProps {
    tabActive: TabbarItemsId;
    setTabActive: (id: TabbarItemsId) => void;
}

export default function Header({ tabActive, setTabActive }: HeaderProps) {
    const underlineRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const updateUnderline = (element: Element | null) => {
        if (element && underlineRef.current) {
            const rect = element.getBoundingClientRect();
            const parentRect = containerRef.current?.getBoundingClientRect();

            if (parentRect) {
                underlineRef.current.style.width = `${rect.width}px`;
                underlineRef.current.style.left = `${rect.left - parentRect.left}px`;
            }
        }
    };

    useEffect(() => {
        const activeTabElement = document.querySelector(`[data-key="${tabActive}"]`);
        updateUnderline(activeTabElement);
    }, [tabActive]);

    const handleMouseEnter = (tab: TabbarItemsId) => {
        const hoveredTabElement = document.querySelector(`[data-key="${tab}"]`);
        updateUnderline(hoveredTabElement);
    };

    const handleMouseLeave = () => {
        const activeTabElement = document.querySelector(`[data-key="${tabActive}"]`);
        updateUnderline(activeTabElement);
    };
    return (
        <header
            className="h-[50px] sticky top-0 z-5 left-0 dark:bg-neutral-900 bg-white pt-2 border-b border-border -mt-4"
            ref={containerRef}
        >
            <ul className="flex w-full h-full items-center justify-start gap-2">
                {TAB_ITEMS.map((item) => (
                    <li
                        key={item.id}
                        onClick={() => setTabActive(item.id)}
                        className={cn(
                            "pe-[80px] py-[10px] text-muted-foreground text-base font-semibold cursor-pointer",
                            {
                                "text-foreground": tabActive === item.id,
                            }
                        )}
                        onMouseEnter={() => handleMouseEnter(item.id)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span data-key={item.id}>{item.label}</span>
                    </li>
                ))}
            </ul>
            <div
                ref={underlineRef}
                className="absolute h-0.5 bg-foreground bottom-0 transition-all duration-300 ease-in-out"
            />
        </header>
    );
}
