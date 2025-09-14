import { HEADER_NAME, locales } from "@/i18n/config";
import { getTokens, handleInvalidAccessToken } from "@/middlewares/auth";
import { handleRoleAccess } from "@/middlewares/roleCheck";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { isPathIncluded, protectedPaths, unauthenticatedPaths } from "@/middlewares/pathCheck";

export function middleware(request: NextRequest) {
    const defaultLocale = (request.headers.get(HEADER_NAME) || "en") as (typeof locales)[number];
    const handleI18nRouting = createMiddleware({ locales, defaultLocale });

    const response = handleI18nRouting(request);
    response.headers.set(HEADER_NAME, defaultLocale);

    const { pathname } = request.nextUrl;

    const { access_token, refresh_token } = getTokens(request);
    const isAuthenticated = !!refresh_token;

    const isPrivatePath = isPathIncluded(protectedPaths, pathname);
    const isUnAuthPath = isPathIncluded(unauthenticatedPaths, pathname);

    if (pathname.includes("/refresh-token")) {
        return response;
    }

    const refreshRedirect = handleInvalidAccessToken(access_token, refresh_token, pathname, request, defaultLocale);
    if (refreshRedirect) return refreshRedirect;

    if (isPrivatePath && !isAuthenticated) {
        const url = new URL(`/${defaultLocale}/login`, request.url);
        url.searchParams.set("clearToken", "true");
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    if (isUnAuthPath && isAuthenticated) {
        const redirectFrom = request.nextUrl.searchParams.get("redirect");
        if (redirectFrom) {
            const url = new URL(redirectFrom, request.url);
            return NextResponse.redirect(url);
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (isAuthenticated) {
        const roleRedirect = handleRoleAccess(refresh_token!, pathname, request);
        if (roleRedirect) return roleRedirect;
    }

    return response;
}

export const config = {
    matcher: ["/", "/(vi|en)/:path*"],
};
