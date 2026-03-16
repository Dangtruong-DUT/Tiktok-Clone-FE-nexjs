export default function LinkCircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            {...props}
        >
            <g clip-path="url(#Icon_Color-Link_Circle_svg__a)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 48a24 24 0 1 0 0-48 24 24 0 0 0 0 48Z"
                    fill="#2E75FD"
                ></path>
                <path
                    d="M17.1 21.7c.2-.2.52-.2.71 0l1.17 1.17c.2.2.2.51 0 .7l-1.94 1.95a3.85 3.85 0 1 0 5.44 5.45l1.94-1.95c.2-.2.52-.2.71 0l1.17 1.17c.2.2.2.5 0 .7l-1.95 1.95a6.5 6.5 0 0 1-9.19-9.2l1.95-1.94ZM29.02 24.42a.5.5 0 0 0 0 .71l1.17 1.17c.2.2.5.2.7 0l1.95-1.95a6.5 6.5 0 0 0-9.2-9.19l-1.94 1.95a.5.5 0 0 0 0 .7l1.17 1.17c.2.2.51.2.7 0l1.95-1.95a3.85 3.85 0 1 1 5.45 5.45l-1.95 1.94Z"
                    fill="#fff"
                ></path>
                <path
                    d="M19.88 26.24a.5.5 0 0 0 0 .71l1.17 1.17c.2.2.51.2.7 0l6.37-6.37a.5.5 0 0 0 0-.7l-1.17-1.17a.5.5 0 0 0-.7 0l-6.37 6.36Z"
                    fill="#fff"
                ></path>
            </g>
            <defs>
                <clipPath id="Icon_Color-Link_Circle_svg__a">
                    <path fill="#fff" d="M0 0h48v48H0z"></path>
                </clipPath>
            </defs>
        </svg>
    );
}
