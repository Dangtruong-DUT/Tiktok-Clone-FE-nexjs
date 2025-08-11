import AuthRequestApi from "@/apis/auth.request";
import { HTTP_STATUS } from "@/constants/http";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const cookieStore = await cookies();
    const access_token = cookieStore.get("access_token")?.value;
    const refresh_token = cookieStore.get("refresh_token")?.value;
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
    if (!access_token || !refresh_token) {
        return NextResponse.json({ message: "Missing access token or refresh token." }, { status: HTTP_STATUS.OK });
    }
    try {
        const response = await AuthRequestApi.logout({
            refresh_token,
            access_token,
        });
        return NextResponse.json(response, { status: HTTP_STATUS.OK });
    } catch (error) {
        return NextResponse.json(
            { message: "An unexpected error occurred during logout." },
            { status: HTTP_STATUS.OK }
        );
    }
}
