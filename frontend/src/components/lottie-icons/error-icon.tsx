import LazyLottie, { LottieProps } from '@/components/common/lazy-lottie'
import { memo } from 'react'

function ErrorIcon({ ...props }: Omit<LottieProps, 'path'>) {
    return <LazyLottie {...props} autoplay path='/lottie/Error.json' />
}
export default memo(ErrorIcon)
