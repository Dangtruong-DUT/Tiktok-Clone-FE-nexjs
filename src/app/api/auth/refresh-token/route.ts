import AuthRequestApi from "@/apis/auth.request";
import { HTTP_STATUS } from "@/constants/http";
import { HttpError } from "@/types/errors";
import { TokenPayload } from "@/types/jwt";
import { decodeJwt } from "@/utils/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const cookieStore = await cookies();
    const refresh_token = cookieStore.get("refresh_token")?.value;
    if (!refresh_token) {
        return NextResponse.json({ message: "Missing refresh token." }, { status: HTTP_STATUS.UNAUTHORIZED });
    }
    try {
        const response = await AuthRequestApi.refreshToken({
            refresh_token,
        });

        const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data;
        const decodedAccessToken = decodeJwt<TokenPayload>(newAccessToken);
        const decodedRefreshToken = decodeJwt<TokenPayload>(newRefreshToken);
        cookieStore.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            expires: new Date(decodedAccessToken.exp! * 1000),
        });
        cookieStore.set("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            expires: new Date(decodedRefreshToken.exp! * 1000),
        });
        return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json(error.data, { status: error.status });
        } else {
            console.error("Refresh token error:", error);
            return NextResponse.json(
                { message: "An unexpected error occurred during refresh token." },
                { status: HTTP_STATUS.INTERNAL_SERVER_STATUS }
            );
        }
    }
}
