import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    images: {
        domains: ["ttl.edu.vn"],
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
