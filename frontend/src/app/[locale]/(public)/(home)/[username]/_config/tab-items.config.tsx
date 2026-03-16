import { Grid3X3, Heart, Bookmark } from "lucide-react";

export type ID_TAB_ITEMS = "videos" | "favorites" | "liked";

export type TabItemType = {
    heading: string;
    icon: React.ReactNode;
    id: ID_TAB_ITEMS;
};

const TAB_ITEMS: TabItemType[] = [
    { heading: "Videos", icon: <Grid3X3 width="1.2em" height="1.2em" />, id: "videos" },
    { heading: "Favorites", icon: <Bookmark width="1.2em" height="1.2em" />, id: "favorites" },
    { heading: "Liked", icon: <Heart width="1.2em" height="1.2em" />, id: "liked" },
] as const;

export default TAB_ITEMS;
