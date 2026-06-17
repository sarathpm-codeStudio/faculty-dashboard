/**
 * Decides the account_verified value to write when a faculty saves/(re)submits
 * their profile, based on their previous status:
 *  - APPROVED                → APPROVED   (already verified; editing allowed details keeps it verified)
 *  - REJECTED / RESUBMITTED  → RESUBMITTED (a correction to a rejected profile)
 *  - NOT_COMPLETED / PENDING → PENDING    (first review or still pending)
 */
export const nextSubmissionStatus = (
    previous?: string | null,
): 'PENDING' | 'RESUBMITTED' | 'APPROVED' => {
    if (previous === 'APPROVED') return 'APPROVED'
    if (previous === 'REJECTED' || previous === 'RESUBMITTED') return 'RESUBMITTED'
    return 'PENDING'
}
