import LazyLottie, { LottieProps } from "@/components/lazy-lottie";
import { memo } from "react";

function LikedIcon({ ...props }: Omit<LottieProps, "path">) {
    return <LazyLottie {...props} autoplay path="/lottie/like.json" />;
}
export default memo(LikedIcon);
