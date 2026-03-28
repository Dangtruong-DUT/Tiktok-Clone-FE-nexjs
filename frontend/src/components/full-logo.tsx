import { BRAND_CONFIG } from '@/config/brand.config'

type Props = {
    className?: string
    width?: string
    height?: string
    color?: string
}

export default function FullLogo({ className, width, height, color = 'currentColor' }: Props) {
    const logoTextOutlineShadow =
        '0 0 1px rgba(255,255,255,0.55), 1px 0 0 rgba(153,0,255,0.35), -1px 0 0 rgba(153,0,255,0.35), 0 1px 0 rgba(255,0,204,0.28), 0 -1px 0 rgba(255,0,204,0.28), 0 0 8px rgba(153,0,255,0.22)'

    return (
        <div className='inline-flex items-center gap-2 text-2xl'>
            <svg
                color={color}
                className={className}
                fill='none'
                height={height}
                viewBox='0 0 600 600'
                xmlns='http://www.w3.org/2000/svg'
            >
                <defs>
                    <linearGradient id='grad_refined' x1='0%' x2='100%' y1='0%' y2='100%'>
                        <stop offset='0%' style={{ stopColor: '#FF9900', stopOpacity: 1 }}></stop>
                        <stop offset='50%' style={{ stopColor: '#FF00CC', stopOpacity: 1 }}></stop>
                        <stop offset='100%' style={{ stopColor: '#9900FF', stopOpacity: 1 }}></stop>
                    </linearGradient>
                    <filter height='140%' id='shadow' width='140%' x='-20%' y='-20%'>
                        <feGaussianBlur in='SourceAlpha' stdDeviation='5'></feGaussianBlur>
                        <feOffset dx='0' dy='5' result='offsetblur'></feOffset>
                        <feComponentTransfer>
                            <feFuncA slope='0.2' type='linear'></feFuncA>
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode></feMergeNode>
                            <feMergeNode in='SourceGraphic'></feMergeNode>
                        </feMerge>
                    </filter>
                </defs>
                <path
                    d='M165,540 L535,300 L250,300'
                    opacity='0.9'
                    stroke='#9900FF'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='60'
                ></path>
                <path d='M150,100 L500,300 L150,500 Z' fill='url(#grad_refined)' filter='url(#shadow)'></path>
                <g transform='translate(150, 240)'>
                    <rect
                        fill='white'
                        fillOpacity='0.25'
                        height='110'
                        rx='15'
                        stroke='white'
                        strokeWidth='2'
                        width='180'
                        x='0'
                        y='0'
                    ></rect>
                    <path
                        d='M30,110 L30,140 L60,110 Z'
                        fill='white'
                        fillOpacity='0.25'
                        stroke='white'
                        strokeLinejoin='round'
                        strokeWidth='2'
                    ></path>
                    <circle cx='50' cy='55' fill='white' r='10'></circle>
                    <circle cx='90' cy='55' fill='white' r='10'></circle>
                    <circle cx='130' cy='55' fill='white' r='10'></circle>
                </g>
            </svg>
            <span
                className='
                font-bold leading-none
                bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600
                bg-clip-text text-transparent
                tracking-wide
            '
                style={{
                    textShadow: `
                    0 0 6px rgba(255, 0, 204, 0.35),
                    0 0 12px rgba(153, 0, 255, 0.25)
                `
                }}
            >
                {BRAND_CONFIG.APP_NAME}
            </span>
        </div>
    )
}
