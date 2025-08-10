import jwt from "jsonwebtoken";

export const decodeJwt = <T>(token: string): T => {
    try {
        const decoded = jwt.decode(token);
        return decoded as T;
    } catch (error) {
        console.error("Failed to decode JWT:", error);
        return {} as T; // Return an empty object if decoding fails
    }
};
