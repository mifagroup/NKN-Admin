// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useSearchParams } from 'next/navigation'

// API Imports
import type { components } from '../api/v1'

export const useQueryParams = <T>(page_limit?: number) => {
  const searchParams = useSearchParams()

  const [queryParams, setQueryParams] = useState<Partial<components['parameters']> & T>({
    page: 1,
    page_limit: page_limit ?? 10
  } as Partial<components['parameters']> & T)

  useEffect(() => {
    // Create a new object to store parameters
    const params: Partial<components['parameters']> = {}

    for (const [key, value] of searchParams.entries()) {
      // Check if the key is in the 'filter[search]' format
      const match = key.match(/^filter\[(.+)\]$/)

      if (match) {
        const filterKey = match[1] // Extract the 'search' part of 'filter[search]'

        // Initialize the filter object if it doesn't exist
        if (!params.filter) {
          params.filter = {}
        }

        // Set the dynamic filter key
        ;(params.filter as any)[filterKey] = value
      } else {
        // Otherwise, treat it as a normal query parameter
        params[key as keyof components['parameters']] = value as any
      }
    }

    // Merge new params with the default state
    setQueryParams(prev => ({
      ...prev,
      ...params
    }))
  }, [])

  return {
    queryParams,
    setQueryParams
  }
}
