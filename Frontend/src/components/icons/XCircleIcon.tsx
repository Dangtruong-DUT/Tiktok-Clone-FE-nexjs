export default function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            {...props}
        >
            <g clip-path="url(#Icon_Color-Twitter_Circle_svg__a)">
                <circle cx="24" cy="24" r="24" fill="#000"></circle>
                <path
                    d="M31.76 11.8h4.14l-9.04 10.34L37.5 36.2h-8.33l-6.53-8.53-7.46 8.53h-4.15l9.68-11.05L10.5 11.8h8.54l5.9 7.8 6.82-7.8Zm-1.45 21.92h2.3L17.8 14.15h-2.47l14.98 19.57Z"
                    fill="#fff"
                ></path>
            </g>
            <defs>
                <clipPath id="Icon_Color-Twitter_Circle_svg__a">
                    <path fill="#fff" d="M0 0h48v48H0z"></path>
                </clipPath>
            </defs>
        </svg>
    );
}
