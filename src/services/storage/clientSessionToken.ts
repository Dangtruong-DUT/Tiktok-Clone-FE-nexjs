"use client";

import { UserType } from "@/types/schemas/User.schema";

const isClient = typeof window !== "undefined";

class ClientSessionToken {
    private static instance: ClientSessionToken;
    private access_token: string | null = null;
    private refresh_token: string | null = null;
    private user_profile: UserType | null = null;

    private constructor() {
        if (!isClient) return;
        this.access_token = localStorage.getItem("access_token");
        this.refresh_token = localStorage.getItem("refresh_token");
        this.user_profile = JSON.parse(localStorage.getItem("user_profile") || "") as UserType | null;
    }

    public static getInstance(): ClientSessionToken {
        if (!ClientSessionToken.instance) {
            ClientSessionToken.instance = new ClientSessionToken();
        }
        return ClientSessionToken.instance;
    }

    public getAccessToken(): string | null {
        if (!isClient) return null;
        return this.access_token;
    }

    public getRefreshToken(): string | null {
        if (!isClient) return null;
        return this.refresh_token;
    }

    public setAccessToken(token: string): void {
        if (!isClient) throw new Error("Not running in client environment");
        this.access_token = token;
        localStorage.setItem("access_token", token);
    }

    public setRefreshToken(token: string): void {
        if (!isClient) throw new Error("Not running in client environment");
        this.refresh_token = token;
        localStorage.setItem("refresh_token", token);
    }

    public getUserProfile(): UserType | null {
        if (!isClient) return null;
        return this.user_profile;
    }

    public setUserProfile(profile: UserType | null): void {
        if (!isClient) throw new Error("Not running in client environment");
        this.user_profile = profile;
        localStorage.setItem("user_profile", JSON.stringify(profile));
    }

    public clearToken(): void {
        if (!isClient) return;
        this.access_token = null;
        localStorage.removeItem("access_token");
        this.refresh_token = null;
        localStorage.removeItem("refresh_token");
        this.user_profile = null;
        localStorage.removeItem("user_profile");
    }
}

const clientSessionToken = ClientSessionToken.getInstance();

export default clientSessionToken;
