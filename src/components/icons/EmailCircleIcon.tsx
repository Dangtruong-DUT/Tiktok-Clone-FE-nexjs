import { SVGProps } from "react";

export default function EmailCircleIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 48a24 24 0 1 0 0-48 24 24 0 0 0 0 48Z"
                fill="#0DBEF3"
            ></path>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.63 14.9a2.1 2.1 0 0 0-2.09 2.09V31c0 1.16.94 2.1 2.1 2.1h20.73a2.1 2.1 0 0 0 2.09-2.1V17a2.1 2.1 0 0 0-2.1-2.1H13.64Zm20.1 2.48L24 24.11l-9.72-6.73a.52.52 0 0 0-.82.43v1.28L24 26.4l10.54-7.3v-1.28a.52.52 0 0 0-.82-.43Z"
                fill="#fff"
            ></path>
        </svg>
    );
}
