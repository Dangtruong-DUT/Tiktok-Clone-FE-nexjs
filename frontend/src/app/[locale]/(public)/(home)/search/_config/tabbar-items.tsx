export type TabbarItemsId = "USERS" | "VIDEOS";

export interface TabItem {
    label: string;
    id: TabbarItemsId;
}

export const TAB_ITEMS: TabItem[] = [
    { label: "Users", id: "USERS" },
    { label: "Videos", id: "VIDEOS" },
];
