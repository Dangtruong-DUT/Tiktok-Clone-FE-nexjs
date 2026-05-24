import LazyLottie, { LottieProps } from '@/components/common/lazy-lottie'
import { memo } from 'react'

function BookmarkIcon({ ...props }: Omit<LottieProps, 'path'>) {
    return <LazyLottie {...props} autoplay path='/lottie/bookmark.json' />
}
export default memo(BookmarkIcon)
