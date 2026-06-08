import LazyLottie, { LottieProps } from '@/components/common/lazy-lottie'
import { memo } from 'react'

function LikedIcon({ ...props }: Omit<LottieProps, 'path'>) {
    return <LazyLottie {...props} autoplay path='/lottie/like.json' />
}
export default memo(LikedIcon)
