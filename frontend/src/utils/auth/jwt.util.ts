export const decodeJwt = <T>(token: string): T => {
    try {
        const payload = token.split('.')[1]
        if (!payload) return {} as T
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        return decoded as T
    } catch {
        return {} as T
    }
}
