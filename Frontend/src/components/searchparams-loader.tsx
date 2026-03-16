"use client";
// modified from https://github.com/vercel/next.js/discussions/61654#discussioncomment-10178402
// context https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout

// nextjs requires that we wrap anything that needs the useSearchParams hook in
// Suspense. since I only need the params for things that occur after the load
// is finished (e.g. form submission) and I don't want to block the UI w/
// suspense, this is a good, childless way of hoisting the params back up to the
// parent component that needs them in a non-UI blocking way

import { type ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";

type SearchParamsLoaderProps = {
    onParamsReceived: (params: ReadonlyURLSearchParams) => void;
};

export const SearchParamsLoader = React.memo(Suspender);

function Suspender(props: SearchParamsLoaderProps) {
    return (
        <Suspense>
            <Suspended {...props} />
        </Suspense>
    );
}

function Suspended({ onParamsReceived }: SearchParamsLoaderProps) {
    const searchParams = useSearchParams();

    useEffect(() => {
        onParamsReceived(searchParams);
    });

    return null;
}

export function useSearchParamsLoader() {
    const [searchParams, setSearchParams] = React.useState<ReadonlyURLSearchParams>();

    return {
        searchParams,
        setSearchParams,
    };
}
