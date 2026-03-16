import React, { SVGProps } from "react";

export function MaterialSymbolsPlayCircleRounded(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            {/* Vòng tròn - giữ theo currentColor */}
            <path
                fill="currentColor"
                d="M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"
            />
            {/* Hình tam giác - đặt màu trắng */}
            <path
                fill="white"
                d="m10.65 15.75 4.875-3.125q.35-.225.35-.625t-.35-.625L10.65 8.25q-.375-.25-.763-.038t-.387.663v6.25q0 .45.388.663t.762-.038"
            />
        </svg>
    );
}

export default MaterialSymbolsPlayCircleRounded;
