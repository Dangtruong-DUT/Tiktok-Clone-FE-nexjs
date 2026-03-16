import { HTTP_STATUS } from "@/constants/http";
import { SetCookieBodyType } from "@/types/auth";
import { HttpError } from "@/types/errors";
import { TokenPayload } from "@/types/jwt";
import { decodeJwt } from "@/utils/jwt";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = (await request.json()) as SetCookieBodyType;
    const cookieStory = await cookies();
    try {
        const { access_token, refresh_token } = body;
        if (!access_token || !refresh_token) {
            throw new HttpError(
                {
                    message: "Access token and refresh token are required.",
                },
                HTTP_STATUS.BAD_REQUEST_STATUS,
                "Access token and refresh token are required."
            );
        }
        const decodedAccessToken = decodeJwt<TokenPayload>(access_token);
        const decodedRefreshToken = decodeJwt<TokenPayload>(refresh_token);
        cookieStory.set("access_token", access_token, {
            httpOnly: true,
            sameSite: "lax",
            expires: new Date(decodedAccessToken.exp * 1000),
            secure: true,
            path: "/",
        });
        cookieStory.set("refresh_token", refresh_token, {
            httpOnly: true,
            sameSite: "lax",
            expires: new Date(decodedRefreshToken.exp * 1000),
            secure: true,
            path: "/",
        });
        return NextResponse.json(body);
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json(error.message, { status: error.status });
        } else {
            console.error("Login error:", error);
            return NextResponse.json(
                { message: "An unexpected error occurred during login." },
                { status: HTTP_STATUS.INTERNAL_SERVER_STATUS }
            );
        }
    }
}
