import { MenuOption } from "@/components/nested-menu/types";

const MENU_ITEMS: MenuOption[] = [
    {
        title: "menuMore.language",
        type: "group",
        selectionType: "single",
        for: ["guest", "user"],
        children: {
            title: "menuMore.language",
            items: [
                {
                    type: "item",
                    value: "en",
                    key: "language",
                    title: "menuMore.language_english",
                    for: ["guest", "user"],
                },
                {
                    type: "item",
                    value: "vi",
                    key: "language",
                    title: "menuMore.language_vietnamese",
                    for: ["guest", "user"],
                },
            ],
        },
    },
    {
        type: "item",
        title: "menuMore.feedback",
        to: "/feedback",
        for: ["guest", "user"],
    },
    {
        type: "group",
        title: "menuMore.darkmode",
        for: ["guest", "user"],
        children: {
            title: "menuMore.darkmode",
            items: [
                {
                    type: "item",
                    title: "menuMore.darkmode_system",
                    key: "theme",
                    value: "system",
                    for: ["guest", "user"],
                },
                {
                    type: "item",
                    title: "menuMore.darkmode_dark",
                    key: "theme",
                    value: "dark",
                    for: ["guest", "user"],
                },
                {
                    type: "item",
                    title: "menuMore.darkmode_light",
                    key: "theme",
                    value: "light",
                    for: ["guest", "user"],
                },
            ],
        },
    },
    {
        type: "item",
        title: "menuMore.settings",
        to: "/settings",
        for: ["user"],
    },
    {
        type: "item",
        key: "logout",
        title: "menuMore.logout",
        for: ["user"],
    },
] as const;

export default MENU_ITEMS;
