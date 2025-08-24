import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    images: {
        domains: ["ttl.edu.vn", "i.pravatar.cc", "localhost"],
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
