const employeePaths = ["/vi/admin", "/en/admin"];
const onlyAdminPaths = ["/vi/admin", "/en/admin"];
const userPaths = [
    "/vi/following",
    "/en/following",
    "/vi/business-suite",
    "/en/business-suite",
    "/vi/tiktokstudio",
    "/en/tiktokstudio",
];
const unauthenticatedPaths = ["/vi/login", "/en/login", "/vi/register", "/en/register"];

const protectedPaths = [...employeePaths, ...onlyAdminPaths, ...userPaths];

export function isPathIncluded(pathList: string[], pathname: string) {
    return pathList.some((path) => pathname.includes(path));
}

export { employeePaths, onlyAdminPaths, userPaths, unauthenticatedPaths, protectedPaths };
