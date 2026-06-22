import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { toast } from 'sonner'
import App from './App'
import './index.css'
import { getErrorMessage } from './lib/queryError'

// Per-query / per-mutation error overrides via the `meta` option:
//   useQuery({ ..., meta: { skipErrorToast: true } })                 → no toast
//   useMutation({ ..., meta: { errorMessage: 'Custom message' } })    → custom text
declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { skipErrorToast?: boolean; errorMessage?: string }
    mutationMeta: { skipErrorToast?: boolean; errorMessage?: string }
  }
}

const queryClient = new QueryClient({
  // Global handler — every query failure shows a toast using the existing sonner toast.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.skipErrorToast) return
      const message = query.meta?.errorMessage || getErrorMessage(error)
      // Stable id keeps the same failing query from stacking duplicate toasts.
      toast.error(message, { id: `query-error-${query.queryHash}` })
    },
  }),
  // Global handler — every mutation failure shows a toast.
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.skipErrorToast) return
      const message = mutation.meta?.errorMessage || getErrorMessage(error)
      toast.error(message)
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min — don't refetch if data is fresh
      retry: 1,                    // retry once on failure
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
