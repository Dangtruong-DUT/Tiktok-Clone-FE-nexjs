"use client";

import Header from "@/app/[locale]/(public)/(home)/search/_components/tabbar-header";
import { TabbarItemsId } from "@/app/[locale]/(public)/(home)/search/_config/tabbar-items";
import { useState } from "react";

export default function SearchResults() {
    const [tabActive, setTabActive] = useState<TabbarItemsId>("USERS");
    return (
        <div className="p-4 mx-auto max-w-[800px] w-[73%] min-w-[420px]">
            <Header tabActive={tabActive} setTabActive={setTabActive} />
        </div>
    );
}
