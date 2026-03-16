import { Search } from "lucide-react";
import LogoBrand from "@/components/logo-brand";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SidebarHeaderProps {
    isOpenSearch: boolean;
    toggleSearchDrawer: () => void;
    searchValue: string;
}

export default function SidebarHeader({ isOpenSearch, toggleSearchDrawer, searchValue }: SidebarHeaderProps) {
    const t = useTranslations("HomePage.sidebar.search");
    return (
        <header
            className={cn("w-full flex flex-col items-stretch mb-3 gap-4 transition-all duration-200 ease-out", {
                "justify-center mr-4": isOpenSearch,
            })}
        >
            <Link href="/" className="flex items-center text-foreground ml-2">
                <LogoBrand small={isOpenSearch} />
            </Link>

            <button
                className={cn("h-10 transition-all duration-200 ease-out", {
                    "w-10": isOpenSearch,
                    "w-52": !isOpenSearch,
                })}
                onClick={toggleSearchDrawer}
            >
                <div
                    className={cn(
                        "flex items-center bg-input w-full h-full rounded-full transition-all duration-200 ease-out",
                        {
                            "justify-center": isOpenSearch,
                            "flex-row": !isOpenSearch,
                        }
                    )}
                >
                    <div
                        className={cn(
                            "p-2 flex justify-center items-center text-foreground",
                            isOpenSearch ? "m-0" : "ml-0.5",
                            "transition-all duration-200 ease-out"
                        )}
                    >
                        <Search size={19} />
                    </div>

                    {!isOpenSearch && (
                        <div
                            className={cn(
                                "ml-[3px] text-sm tracking-[0.15px] transition-all truncate duration-200 ease-out flex-1 text-left pr-2",
                                {
                                    "text-muted-foreground": !searchValue,
                                    "text-foreground": searchValue,
                                }
                            )}
                        >
                            {searchValue || t("searchPlaceholder")}
                        </div>
                    )}
                </div>
            </button>
        </header>
    );
}
