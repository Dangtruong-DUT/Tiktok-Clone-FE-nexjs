import React, { SVGProps } from "react";

export function MaterialSymbolsNoSoundRoundedAnimated(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            {/* Vòng tròn ngoài */}
            <circle cx="12" cy="12" r="10" fill="currentColor" />

            {/* Nhóm loa */}
            <g transform="scale(0.85) translate(2.2, 2.2)">
                <path
                    fill="white"
                    d="M7 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3.25l3-3a1 1 0 0 1 1.7.7v10.6a1 1 0 0 1-1.7.7l-3-3z"
                />
            </g>

            {/* Dấu X - đã chỉnh kích thước, vị trí cho cân đối hơn */}
            <g
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                fill="none"
                transform="translate(1.5, 1.5)"
            >
                <path strokeDasharray="5.6" strokeDashoffset="5.6" d="M13.5 9.5 L16.5 12.5">
                    <animate attributeName="stroke-dashoffset" begin="0.05s" dur="0.1s" values="5.6;0" fill="freeze" />
                </path>
                <path strokeDasharray="5.6" strokeDashoffset="5.6" d="M16.5 9.5 L13.5 12.5">
                    <animate attributeName="stroke-dashoffset" begin="0.1s" dur="0.1s" values="5.6;0" fill="freeze" />
                </path>
            </g>
        </svg>
    );
}

export default MaterialSymbolsNoSoundRoundedAnimated;
