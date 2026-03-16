import LazyLottie, { LottieProps } from "@/components/lazy-lottie";
import { memo } from "react";

function EmptyGhostIcon({ ...props }: Omit<LottieProps, "path">) {
    return <LazyLottie {...props} autoplay path="/lottie/empty ghost.json" />;
}
export default memo(EmptyGhostIcon);
