import { Role } from "@/constants/enum";
import { employeePaths, isPathIncluded, onlyAdminPaths, userPaths } from "@/middlewares/pathCheck";
import { TokenPayload } from "@/types/jwt";
import { decodeJwt } from "@/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

export function handleRoleAccess(access_token: string, pathname: string, request: NextRequest): NextResponse | null {
    const { role } = decodeJwt<TokenPayload>(access_token);

    const isEmployeePath = isPathIncluded(employeePaths, pathname);
    const isUserPath = isPathIncluded(userPaths, pathname);
    const isOnlyAdminPath = isPathIncluded(onlyAdminPaths, pathname);

    if (isOnlyAdminPath && role !== Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (isEmployeePath && role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    if (isUserPath && role !== Role.USER) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return null;
}
