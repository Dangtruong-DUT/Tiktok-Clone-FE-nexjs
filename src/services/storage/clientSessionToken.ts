"use client";

const isClient = typeof window !== "undefined";

class ClientSessionToken {
    private static instance: ClientSessionToken;
    private access_token: string | null = null;
    private refresh_token: string | null = null;

    private constructor() {
        this.access_token = localStorage.getItem("access_token");
        this.refresh_token = localStorage.getItem("refresh_token");
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

    public clearToken(): void {
        this.access_token = null;
        localStorage.removeItem("access_token");
        this.refresh_token = null;
        localStorage.removeItem("refresh_token");
    }
}

const clientSessionToken = ClientSessionToken.getInstance();

export default clientSessionToken;
