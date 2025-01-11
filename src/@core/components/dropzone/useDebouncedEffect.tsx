import { useEffect, type DependencyList } from 'react'

import { useDebouncedCallback } from 'use-debounce'

export function useDebounceEffect(fn: () => void, waitTime: number, deps?: DependencyList) {
  // Create a debounced version of the passed function
  const debouncedFn = useDebouncedCallback(fn, waitTime)

  useEffect(() => {
    // Call the debounced function whenever dependencies change
    debouncedFn()

    // Cleanup is handled by `useDebouncedCallback`, no need for manual timeout clear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFn, ...(deps || [])])
}
