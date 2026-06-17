/**
 * Decides the account_verified value to write when a faculty (re)submits their
 * profile for review, based on their previous status:
 *  - NOT_COMPLETED / PENDING / APPROVED  → PENDING   (first review or fresh re-review)
 *  - REJECTED / RESUBMITTED              → RESUBMITTED (a correction to a rejected profile)
 */
export const nextSubmissionStatus = (
    previous?: string | null,
): 'PENDING' | 'RESUBMITTED' =>
    previous === 'REJECTED' || previous === 'RESUBMITTED' ? 'RESUBMITTED' : 'PENDING'
