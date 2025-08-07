"use client";

import TabBar from "@/app/[locale]/(public)/(home)/[username]/_components/TabBar";
import VideoGrid from "@/app/[locale]/(public)/(home)/[username]/_components/video-grid";
import TAB_ITEMS, { ID_TAB_ITEMS } from "@/app/[locale]/(public)/(home)/[username]/_config/tab-items.config";
import { postList } from "@/mock/mockUserAndVideos";
import { createContext, useState } from "react";

type VideoContainerContextType = {
    activeTabId: ID_TAB_ITEMS;
    setActiveTabId?: (tabId: ID_TAB_ITEMS) => void;
};
const videoContainerContext = createContext<VideoContainerContextType | undefined>(undefined);

export const useVideoContainerContext = () => {
    const context = videoContainerContext;
    if (!context) {
        throw new Error("useVideoContainerContext must be used within a VideoContainerProvider");
    }
    return context;
};

interface VideoContainerProps {
    className?: string;
    username?: string;
}

export default function VideoContainer({ className, username }: VideoContainerProps) {
    const [activeTabId, setActiveTabId] = useState<ID_TAB_ITEMS>("videos");
    return (
        <videoContainerContext.Provider value={{ activeTabId, setActiveTabId }}>
            <TabBar tabs={TAB_ITEMS} activeTabID={activeTabId} onTabChange={setActiveTabId} />
            <VideoGrid videos={postList} />
        </videoContainerContext.Provider>
    );
}
