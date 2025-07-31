import { MenuOption } from "@/components/nested-menu/types";

const MENU_ITEMS: MenuOption[] = [
    {
        title: "Language",
        type: "group",
        selectionType: "single",
        for: ["guest", "user"],
        children: {
            title: "Language",
            items: [
                {
                    type: "item",
                    value: "en",
                    key: "language",
                    title: "English",
                    for: ["guest", "user"],
                },
                {
                    type: "item",
                    value: "vi",
                    key: "language",
                    title: "Vietnamese",
                    for: ["guest", "user"],
                },
            ],
        },
    },
    {
        type: "item",
        title: "Feedback and help",
        to: "/feedback",
        for: ["guest", "user"],
    },
    {
        type: "group",
        title: "Dark mode",
        for: ["guest", "user"],
        children: {
            title: "Dark mode",
            items: [
                {
                    type: "item",
                    title: "Use device theme",
                    key: "theme",
                    value: "system",
                    for: ["guest", "user"],
                },
                {
                    type: "item",
                    title: "Dark mode",
                    key: "theme",
                    value: "dark",
                    for: ["guest", "user"],
                },
                {
                    type: "item",
                    title: "Light mode",
                    key: "theme",
                    value: "light",
                    for: ["guest", "user"],
                },
            ],
        },
    },
    {
        type: "item",
        title: "Settings",
        to: "/settings",
        for: ["user"],
    },
    {
        type: "item",
        title: "Log out",
        to: "/logout",
        for: ["user"],
    },
] as const;

export default MENU_ITEMS;
