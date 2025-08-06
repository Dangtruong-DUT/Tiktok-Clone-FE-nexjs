import LazyLottie, { LottieProps } from "@/components/lazy-lottie";
import { memo } from "react";

function LoadingIcon({ ...props }: Omit<LottieProps, "path">) {
    return <LazyLottie {...props} autoplay path="/lottie/TikTok Loader.json" />;
}
export default memo(LoadingIcon);
