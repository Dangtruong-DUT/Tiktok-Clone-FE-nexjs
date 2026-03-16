export default function TelegramCircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            {...props}
        >
            <g clip-path="url(#Icon_Color-Telegram_Circle_svg__a)">
                <path
                    d="M7.03 40.97A24 24 0 1 0 40.97 7.03 24 24 0 0 0 7.03 40.97Z"
                    fill="url(#Icon_Color-Telegram_Circle_svg__b)"
                ></path>
                <path
                    d="m9.99 23.8 16.16-6.67c1.6-.7 7-2.91 7-2.91s2.5-.97 2.3 1.39c-.07.97-.63 4.37-1.18 8.04l-1.74 10.9s-.14 1.59-1.32 1.87c-1.18.27-3.12-.97-3.46-1.25-.28-.21-5.2-3.33-7.01-4.86-.49-.41-1.04-1.25.07-2.22 2.5-2.29 5.48-5.13 7.28-6.93.84-.84 1.67-2.78-1.8-.42l-9.78 6.59s-1.11.7-3.2.07c-2.07-.63-4.5-1.46-4.5-1.46S7.14 24.9 9.99 23.8Z"
                    fill="#fff"
                ></path>
            </g>
            <defs>
                <linearGradient
                    id="Icon_Color-Telegram_Circle_svg__b"
                    x1="40.97"
                    y1="7.03"
                    x2="7.03"
                    y2="40.97"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="#37AEE2"></stop>
                    <stop offset="1" stop-color="#1E96C8"></stop>
                </linearGradient>
                <clipPath id="Icon_Color-Telegram_Circle_svg__a">
                    <path fill="#fff" d="M0 0h48v48H0z"></path>
                </clipPath>
            </defs>
        </svg>
    );
}
