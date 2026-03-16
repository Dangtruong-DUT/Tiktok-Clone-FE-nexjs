import AuthRequestApi from "@/apis/auth.request";
import { HTTP_STATUS } from "@/constants/http";
import { HttpError } from "@/types/errors";
import { TokenPayload } from "@/types/jwt";
import { decodeJwt } from "@/utils/jwt";
import { LoginReqBodyType } from "@/utils/validations/auth.schema";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = (await request.json()) as LoginReqBodyType;
    const cookieStore = await cookies();
    try {
        const response = await AuthRequestApi.login(body);
        const { access_token, refresh_token } = response.data;
        const decodedAccessToken = decodeJwt<TokenPayload>(access_token);
        const decodedRefreshToken = decodeJwt<TokenPayload>(refresh_token);
        cookieStore.set("access_token", access_token, {
            httpOnly: true,
            sameSite: "lax",
            expires: new Date(decodedAccessToken.exp! * 1000),
            secure: true,
            path: "/",
        });
        cookieStore.set("refresh_token", refresh_token, {
            httpOnly: true,
            sameSite: "lax",
            expires: new Date(decodedRefreshToken.exp! * 1000),
            secure: true,
            path: "/",
        });
        return NextResponse.json(response);
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json(error.data, { status: error.status });
        } else {
            console.error("Login error:", error);
            return NextResponse.json(
                { message: "An unexpected error occurred during login." },
                { status: HTTP_STATUS.INTERNAL_SERVER_STATUS }
            );
        }
    }
}
