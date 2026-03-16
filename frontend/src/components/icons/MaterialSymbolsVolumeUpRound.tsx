import React, { SVGProps } from "react";

export function MaterialSymbolsVolumeUpRoundedAnimated(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            {/* Vòng tròn nền */}
            <circle cx="12" cy="12" r="10" fill="currentColor" />

            {/* Biểu tượng loa */}
            <g transform="scale(0.85) translate(2.2, 2.2)">
                <path
                    fill="white"
                    d="M7 15H4q-.425 0-.712-.288T3 14v-4q0-.425.288-.712T4 9h3l3.3-3.3q.475-.475 1.088-.213t.612.938v11.15q0 .675-.612.938T10.3 18.3z"
                />
            </g>

            {/* 3 vòng cung âm thanh nhỏ dần */}
            <g stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round">
                {/* Nhỏ nhất */}
                <path d="M13.3 12 A2 2 0 0 1 13.3 12.01" strokeDasharray="4.2" strokeDashoffset="4.2">
                    <animate attributeName="stroke-dashoffset" begin="0.05s" dur="0.1s" values="4.2;0" fill="freeze" />
                </path>

                {/* Trung bình */}
                <path d="M14.2 10.8 A3.2 3.2 0 0 1 14.2 13.2" strokeDasharray="6.8" strokeDashoffset="6.8">
                    <animate attributeName="stroke-dashoffset" begin="0.12s" dur="0.15s" values="6.8;0" fill="freeze" />
                </path>

                {/* Lớn nhất */}
                <path d="M15.4 9.5 A4.5 4.5 0 0 1 15.4 14.5" strokeDasharray="9.2" strokeDashoffset="9.2">
                    <animate attributeName="stroke-dashoffset" begin="0.2s" dur="0.25s" values="9.2;0" fill="freeze" />
                </path>
            </g>
        </svg>
    );
}

export default MaterialSymbolsVolumeUpRoundedAnimated;
