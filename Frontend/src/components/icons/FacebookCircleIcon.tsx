export default function FacebookCircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            {...props}
        >
            <g clip-path="url(#Icon_Color-Facebook_Circle_svg__a)">
                <circle cx="24" cy="24" r="24" fill="#fff"></circle>
                <path
                    d="M27.75 47.7a24 24 0 1 0-7.52 0V31.15H14.1v-6.98h6.13s-.03-3.98 0-5.75.38-3.47 1.3-5.03c1.4-2.4 3.58-3.57 6.26-3.9 2.27-.29 4.67-.03 6.92.4v5.96l-.68-.02c-1.02-.03-2.32-.07-3.24.07-1.9.3-3 1.52-3.03 3.44-.04 1.5-.02 4.83-.02 4.83h6.69l-1.09 6.98h-5.6v16.57Z"
                    fill="#0075FA"
                ></path>
            </g>
            <defs>
                <clipPath id="Icon_Color-Facebook_Circle_svg__a">
                    <path fill="#fff" d="M0 0h48v48H0z"></path>
                </clipPath>
            </defs>
        </svg>
    );
}
