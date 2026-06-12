// lib/queryError.ts
// Centralised error-message extractor for TanStack Query (queries + mutations).
// Pulls a human-readable message out of axios / supabase / generic errors.

import { isAxiosError } from 'axios'

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  // Axios / API errors
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string; detail?: string }
      | undefined

    return (
      data?.message ||
      data?.error ||
      data?.detail ||
      error.message ||
      fallback
    )
  }

  // Supabase errors & plain Error objects expose `.message`
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'string' && error) {
    return error
  }

  return fallback
}
