

export const generateUniqueId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from(
        { length: 8 },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join('')
    // e.g. "K3X9A2WQ"
}