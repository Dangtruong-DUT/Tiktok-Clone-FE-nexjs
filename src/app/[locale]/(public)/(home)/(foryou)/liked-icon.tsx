import LazyLottie from "@/components/lazy-lottie";
import { memo } from "react";
import likeJson from "@/assets/lottie/like.json";

function LikedIcon() {
    return <LazyLottie id="like" className="w-12 h-12" loop={false} autoplay getAnimationData={async () => likeJson} />;
}
export default memo(LikedIcon);
