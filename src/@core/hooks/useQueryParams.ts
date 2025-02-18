// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useSearchParams } from 'next/navigation'

export type QueryParamsType = {
  page?: number
  page_limit?: number
  per_page?: number
  filter?: any
  sort?: string
}

export const useQueryParams = <T>(page_limit?: number) => {
  const searchParams = useSearchParams()

  const [queryParams, setQueryParams] = useState<QueryParamsType>({
    page: 1,
    page_limit: page_limit ?? 10
  })

  useEffect(() => {
    // Create a new object to store parameters
    const params = {}

    for (const [key, value] of searchParams.entries()) {
      // Check if the key is in the 'filter[search]' format
      const match = key.match(/^filter\[(.+)\]$/)

      if (match) {
        const filterKey = match[1] // Extract the 'search' part of 'filter[search]'
      } else {
        // Otherwise, treat it as a normal query parameter
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
