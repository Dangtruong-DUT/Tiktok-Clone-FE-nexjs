export type MenuOption = MenuGroup | MenuItem;

export interface MenuGroup {
    type: "group";
    title: string;
    groupKey?: string;
    selectionType?: "single" | "multiple";
    children: {
        title: string;
        items: MenuOption[];
    };
    for: Array<"guest" | "user">;
}

export interface MenuItem {
    type: "item";
    title: string;
    to?: string;
    for: Array<"guest" | "user">;
    key?: string;
    value?: string;
}
