import jwt from "jsonwebtoken";

export const decodeJwt = <T>(token: string): T => {
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== "object") {
        return {} as T;
    }
    return decoded as T;
};
