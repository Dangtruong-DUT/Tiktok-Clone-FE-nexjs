// DefaultPage acts as a placeholder.
// Once mounted, the component redirects the user to the actual pathName.
// Using window.location.href ensures a full redirect, bypassing intercepting routes,

import FullPageReload from "@/components/full-page-reload";

// and forces the target page to load instead of being blocked.
export default async function DefaultPage() {
    return <FullPageReload />;
}
