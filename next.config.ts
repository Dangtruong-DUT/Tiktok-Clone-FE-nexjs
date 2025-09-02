import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
    images: {
        domains: [
            "ttl.edu.vn",
            "i.pravatar.cc",
            "localhost",
            "api.taplamit.tech",
            "tiktok-clone-taplamit.s3.ap-southeast-2.amazonaws.com",
        ],
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
