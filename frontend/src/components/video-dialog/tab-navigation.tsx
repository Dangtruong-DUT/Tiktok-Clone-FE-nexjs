import { cn } from "@/lib/utils";

export type TabNavigationType = "comments" | "creator";

export type TabNavigationProps = {
    activeTab: TabNavigationType;
    setActiveTab: (tab: TabNavigationType) => void;
    className?: string;
};

export default function TabNavigation({ activeTab, setActiveTab, className }: TabNavigationProps) {
    return (
        <div className={cn("flex border-b", className)}>
            <button
                onClick={() => setActiveTab("comments")}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "comments"
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
                Comments
            </button>
            <button
                onClick={() => setActiveTab("creator")}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "creator"
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
                Creator videos
            </button>
        </div>
    );
}
