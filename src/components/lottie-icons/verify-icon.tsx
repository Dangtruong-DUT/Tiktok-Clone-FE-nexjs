import LazyLottie, { LottieProps } from "@/components/lazy-lottie";
import { memo } from "react";

function VerifyIcon({ ...props }: Omit<LottieProps, "path">) {
    return <LazyLottie {...props} autoplay path="/lottie/Verificado.json" />;
}
export default memo(VerifyIcon);
