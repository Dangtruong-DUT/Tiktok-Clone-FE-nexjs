import LazyLottie, { LottieProps } from "@/components/lazy-lottie";
import { memo } from "react";

function BookmarkIcon({ ...props }: Omit<LottieProps, "path">) {
    return <LazyLottie {...props} loop={false} autoplay path="lottie/bookmark.json" />;
}
export default memo(BookmarkIcon);
