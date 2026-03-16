/* eslint-disable @typescript-eslint/no-explicit-any */
import envConfig from "@/config/app.config";
import { HTTP_STATUS } from "@/constants/http";
import { redirect } from "@/i18n/navigation";
import { EntityError, HttpError } from "@/types/errors";
import { getLocale } from "next-intl/server";

const isClient = typeof window !== "undefined";

export type CustomOptionsType = RequestInit & { baseUrl?: string };

type RequestPropsType = {
    method: "GET" | "POST" | "PUT" | "DELETE";
    url: string;
    options?: CustomOptionsType;
};

export async function clientRequest<response>({ method, url, options = {} }: RequestPropsType): Promise<response> {
    try {
        let baseUrl = options.baseUrl ?? envConfig.NEXT_PUBLIC_API_ENDPOINT;
        if (url.startsWith("/")) url = url.slice(1);
        if (!baseUrl.endsWith("/")) baseUrl += "/";
        const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

        const isFormData = options.body instanceof FormData;
        const headers: Record<string, string> = isFormData ? {} : { "Content-Type": "application/json" };
        Object.assign(headers, options.headers);

        const response = await fetch(fullUrl, {
            ...options,
            method,
            headers,
            body: isFormData ? options.body : JSON.stringify(options.body),
        });

        if (!response.ok) {
            const errorPayload = await response.json();
            if (response.status === HTTP_STATUS.ENTITY_ERROR_STATUS) {
                throw new EntityError(errorPayload);
            }
            throw new HttpError(errorPayload, response.status, errorPayload.message || "Request failed");
        }

        return await response.json();
    } catch (error) {
        if (isClient) throw error;

        if (error instanceof HttpError && error.status === HTTP_STATUS.UNAUTHORIZED) {
            const token = (options.headers as any)?.Authorization?.replace("Bearer ", "") || "";
            const locale = await getLocale();
            redirect({
                href: `/logout?accessToken=${token}`,
                locale,
            });
        }
        throw error;
    }
}

class HttpClient {
    private static instance: HttpClient | null = null;

    private constructor() {}

    public static getInstance(): HttpClient {
        if (!HttpClient.instance) {
            HttpClient.instance = new HttpClient();
        }
        return HttpClient.instance;
    }

    get<response>(url: string, options?: Omit<CustomOptionsType, "body">) {
        return clientRequest<response>({
            method: "GET",
            url,
            options,
        });
    }

    post<response>(url: string, body: any, options?: Omit<CustomOptionsType, "body">): Promise<response> {
        return clientRequest<response>({
            method: "POST",
            url,
            options: {
                ...options,
                body,
            },
        });
    }

    put<response>(url: string, body: any, options?: Omit<CustomOptionsType, "body">): Promise<response> {
        return clientRequest<response>({
            method: "PUT",
            url,
            options: {
                ...options,
                body,
            },
        });
    }

    delete<response>(url: string, options?: Omit<CustomOptionsType, "body">): Promise<response> {
        return clientRequest<response>({
            method: "DELETE",
            url,
            options,
        });
    }
}
const httpClient = HttpClient.getInstance();

export default httpClient;
