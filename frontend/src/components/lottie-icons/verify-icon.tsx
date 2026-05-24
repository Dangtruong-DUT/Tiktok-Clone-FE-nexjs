import LazyLottie, { LottieProps } from '@/components/common/lazy-lottie'
import { memo } from 'react'

function VerifyIcon({ ...props }: Omit<LottieProps, 'path'>) {
    return <LazyLottie {...props} autoplay path='/lottie/Verificado.json' />
}
export default memo(VerifyIcon)
