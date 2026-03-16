import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "@next/env";
const { loadEnvConfig } = pkg;

loadEnvConfig(process.cwd());

export default defineConfig({
    plugins: [tsconfigPaths(), react()],
    test: {
        environment: "jsdom",
        coverage: {
            provider: "v8",
            all: false,
        },
    },
    resolve: {
        alias: {
            "@": "/src",
        },
    },
});
