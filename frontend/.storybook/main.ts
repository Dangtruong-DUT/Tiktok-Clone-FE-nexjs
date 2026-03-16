import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@chromatic-com/storybook",
        "@storybook/addon-docs",
        "@storybook/addon-onboarding",
        "@storybook/addon-a11y",
        "@storybook/addon-vitest",
    ],
    framework: {
        name: "@storybook/nextjs-vite",
        options: {},
    },
    staticDirs: [
        {
            from: "../src/assets/fonts",
            to: "src/assets/fonts",
        },
        "../public",
    ],
    features: {
        experimentalRSC: true,
    },
    viteFinal: async (config, { configType }) => {
        if (!config.resolve) {
            config.resolve = { alias: {} };
        }
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            "next-intl/server": require.resolve("./mocks/next-intl-server"),
        };
        return config;
    },
};
export default config;
