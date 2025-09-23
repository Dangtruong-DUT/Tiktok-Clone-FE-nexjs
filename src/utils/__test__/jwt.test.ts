import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import { decodeJwt } from "@/utils/jwt";

describe("decodeJwt", () => {
    it("should decode a token", () => {
        const token = jwt.sign({ userId: 1 }, "secret");
        const decoded = jwt.decode(token);
        expect(decodeJwt(token)).toEqual(decoded);
    });
});
