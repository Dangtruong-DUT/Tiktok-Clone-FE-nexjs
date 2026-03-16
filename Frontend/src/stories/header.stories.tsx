import Header from "@/components/header-v1";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import React from "react";

const meta = {
    title: "Components/Header",
    component: Header,
    parameters: {
        React: {
            src: { rsc: false },
        },
        layout: "fullscreen",
        nextjs: {
            appDirectory: true,
            router: {
                pathname: "/",
                asPath: "/",
                query: {},
            },
        },
        docs: {
            description: {
                component:
                    "Header component with logo and help link. Uses next-intl for internationalization and includes navigation to home and contact support.",
            },
        },
    },
    tags: ["autodocs"],
    argTypes: {
        classname: {
            control: "text",
            description: "Additional CSS classes to apply to the header",
            table: {
                type: { summary: "string" },
                defaultValue: { summary: "undefined" },
            },
        },
    },
    decorators: [
        (Story) => (
            <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default header with standard styling.
 * Shows the TikTok logo on the left and help link on the right.
 */
export const Default: Story = {
    args: {},
};

/**
 * Header with custom styling and background color.
 */
export const WithCustomClass: Story = {
    args: {
        classname: "bg-white shadow-md border-b",
    },
    parameters: {
        docs: {
            description: {
                story: "Header with additional CSS classes for styling, including shadow and border.",
            },
        },
    },
};

export const DarkTheme: Story = {
    args: {
        classname: "bg-gray-900 text-white border-b border-gray-700",
    },
    decorators: [
        (Story) => (
            <div style={{ minHeight: "100vh", backgroundColor: "#1a1a1a" }}>
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                story: "Header styled for dark theme with dark background and light text.",
            },
        },
        backgrounds: { default: "dark" },
    },
};

/**
 * Header with colored background.
 */
export const ColoredBackground: Story = {
    args: {
        classname: "bg-gradient-to-r from-pink-500 to-purple-600 text-white",
    },
    decorators: [
        (Story) => (
            <div style={{ minHeight: "100vh", backgroundColor: "#f0f0f0" }}>
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                story: "Header with gradient background matching TikTok's brand colors.",
            },
        },
    },
};

/**
 * Header with increased height and padding.
 */
export const LargeHeader: Story = {
    args: {
        classname: "px-8 h-20 bg-white shadow-lg border-b-2 border-gray-200",
    },
    parameters: {
        docs: {
            description: {
                story: "Header with increased height and padding for a more prominent look.",
            },
        },
    },
};

/**
 * Minimal header without extra styling.
 */
export const Minimal: Story = {
    args: {
        classname: "bg-transparent",
    },
    decorators: [
        (Story) => (
            <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                story: "Minimal header with transparent background for overlay use cases.",
            },
        },
    },
};
