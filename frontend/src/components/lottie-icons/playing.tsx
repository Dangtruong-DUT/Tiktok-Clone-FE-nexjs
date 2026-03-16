import LazyLottie, { LottieProps } from "@/components/lazy-lottie";
import { memo } from "react";

function PlayingIcon({ ...props }: Omit<LottieProps, "path">) {
    return <LazyLottie {...props} autoplay path="/lottie/playing.json" />;
}
export default memo(PlayingIcon);
