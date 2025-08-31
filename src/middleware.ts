import { HEADER_NAME, locales } from "@/i18n/config";
import { getTokens, handleInvalidAccessToken } from "@/middlewares/auth";
import { handleRoleAccess } from "@/middlewares/roleCheck";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { isPathIncluded, protectedPaths, unauthenticatedPaths } from "@/middlewares/pathCheck";

export function middleware(request: NextRequest) {
    const defaultLocale = (request.headers.get(HEADER_NAME) || "en") as (typeof locales)[number];
    const handleI18nRouting = createMiddleware({
        locales,
        defaultLocale,
    });
    const response = handleI18nRouting(request);
    response.headers.set(HEADER_NAME, defaultLocale);

    const { pathname } = request.nextUrl;
    console.log("Middleware passed for path:", pathname);

    const { access_token, refresh_token } = getTokens(request);
    const isAccessTokenValid = !!access_token;
    const isAuthenticated = !!refresh_token;

    const isPrivatePath = isPathIncluded(protectedPaths, pathname);
    const isUnAuthPath = isPathIncluded(unauthenticatedPaths, pathname);

    if (pathname.includes("/refresh-token")) {
        return response;
    }

    // Handle refresh token
    const refreshRedirect = handleInvalidAccessToken(access_token, refresh_token, pathname, request, defaultLocale);
    if (refreshRedirect != null) return refreshRedirect;

    // Not authenticated trying to access private
    if (isPrivatePath && !isAuthenticated) {
        const url = new URL(`/${defaultLocale}/login`, request.url);
        url.searchParams.set("clearToken", "true");
        return NextResponse.redirect(url);
    }

    // Authenticated trying to access login/register
    if (isUnAuthPath && isAuthenticated) {
        const url = new URL("/", request.url);
        return NextResponse.redirect(url);
    }

    // Authenticated + access token valid => Check role access
    if (isAccessTokenValid && isAuthenticated) {
        const NextResponse = handleRoleAccess(access_token!, pathname, request);
        if (NextResponse) {
            return NextResponse;
        }
    }

    return response;
}

export const config = {
    matcher: ["/", "/(vi|en)/:path*"],
};
