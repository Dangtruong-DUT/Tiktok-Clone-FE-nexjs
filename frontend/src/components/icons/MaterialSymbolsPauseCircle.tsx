import React, { SVGProps } from "react";

export function MaterialSymbolsPauseCircle(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
            {/* Vòng tròn - theo currentColor */}
            <path
                fill="currentColor"
                d="M12 22q-2.075 0-3.9-.788T4.925 19.075T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.137T12 22"
            />
            {/* Biểu tượng pause - màu trắng */}
            <path fill="white" d="M9 16h2V8H9zM13 16h2V8h-2z" />
        </svg>
    );
}

export default MaterialSymbolsPauseCircle;
