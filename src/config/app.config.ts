import z from "zod";

const configSchema = z.object({
    NEXT_PUBLIC_API_ENDPOINT: z.string().url(),
    NEXT_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI: z.string().url(),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
    NEXT_APP_ENV: z.enum(["development", "production"]).default("development"),
});

const config = configSchema.safeParse({
    NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI: process.env.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_APP_ENV: process.env.NEXT_APP_ENV,
});

if (!config.success) {
    console.error("Invalid environment variables:", config.error.format());
    throw new Error("Invalid environment variables");
}

const envConfig = config.data;

export const isProduction = envConfig.NEXT_APP_ENV === "production";
export default envConfig;
