import LazyLottie from "@/components/lazy-lottie";
import { memo } from "react";

import bookmarkJson from "@/assets/lottie/bookmark.json";

function BookmarkIcon() {
    return (
        <LazyLottie
            id="bookmark"
            className="w-12 h-12"
            loop={false}
            autoplay
            getAnimationData={async () => bookmarkJson}
        />
    );
}
export default memo(BookmarkIcon);
