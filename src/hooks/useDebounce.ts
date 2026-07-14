import { useEffect, useState } from 'react'

/**
 * Returns `value` only after it has stopped changing for `delay` ms.
 * Used to keep a keystroke from firing a query on every character.
 */
export const useDebounce = <T,>(value: T, delay = 300): T => {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}

export default useDebounce
