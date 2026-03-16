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
    for: Array<RoleType>;
}

export interface MenuItem {
    type: "item";
    title: string;
    to?: string;
    for: Array<RoleType>;
    key?: string;
    value?: string;
}

export type RoleType = "guest" | "user";
