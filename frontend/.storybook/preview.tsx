import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/[locale]/globals.css";
import { NextIntlClientProvider } from "next-intl";
import defaultMessages from "../messages/en.json";

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        nextjs: {
            appDirectory: true,
            router: { pathname: "/", asPath: "/", query: {} },
        },
    },
    decorators: [
        (Story) => (
            <NextIntlClientProvider locale="en" messages={defaultMessages}>
                <Story />
            </NextIntlClientProvider>
        ),
    ],
};

export default preview;
