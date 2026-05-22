export type CreateCouponPayload = {
    code: string
    discountType: 'PERCENTAGE' | 'FLAT'
    discountValue: number
    expiryDate: string
    maxUsage: number
    usagePerPerson: number
    courses: string[]
}