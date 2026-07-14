import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { searchService } from '@/services/searchService'

// Single characters match almost everything, so don't hit the DB until there's
// enough of a term to be meaningful.
export const MIN_SEARCH_LENGTH = 2

export const useGlobalSearch = (term: string) => {
    const trimmed = term.trim()
    const enabled = trimmed.length >= MIN_SEARCH_LENGTH

    return useQuery({
        queryKey: ['global-search', trimmed.toLowerCase()],
        queryFn: () => searchService.search(trimmed),
        enabled,
        staleTime: 30_000,
        // Keep the previous term's results on screen while the next term loads,
        // so the dropdown doesn't blank out between keystrokes.
        placeholderData: keepPreviousData,
        // The dropdown shows its own inline error state; a toast per keystroke
        // would be unbearable.
        meta: { skipErrorToast: true },
    })
}
