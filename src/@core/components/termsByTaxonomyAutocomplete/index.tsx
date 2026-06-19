import React, { useMemo, useState } from 'react'

import { CircularProgress, Autocomplete as MuiAutocomplete } from '@mui/material'

import { useGetDictionary } from '@/utils/useGetDictionary'
import DebouncedInput from '../custom-inputs/DebouncedInput'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import type { OptionType } from '@/@core/types'

type IAutocompleteProps = {
  error?: boolean
  label: string

  /** Taxonomy key to filter terms by (e.g. 'hospital') */
  taxonomyKey: string
  multiple?: boolean
  value?:
    | { value?: string | number | undefined; label?: string | undefined }
    | null
    | undefined
    | { value?: string | number | undefined; label?: string | undefined }[]
  onChange?: (data: any) => void
  disabled?: boolean
}

/**
 * Autocomplete that lists terms belonging to a specific taxonomy key.
 * Resolves the taxonomy id from /taxonomies, then fetches /terms filtered by filter[taxonomy_id].
 */
const TermsByTaxonomyAutocomplete = ({
  error = false,
  multiple = false,
  label,
  taxonomyKey,
  value,
  onChange,
  disabled
}: IAutocompleteProps) => {
  // States

  const [open, setOpen] = useState(false)

  // Hooks

  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const { queryParams, setQueryParams } = useQueryParams()

  // Lazy: taxonomies are fetched only on first open of the dropdown
  const { data: taxonomiesData, isLoading: isLoadingTaxonomies } = useFetch().useQuery(
    'get',
    '/taxonomies',
    {},
    {
      enabled: open
    }
  )

  const taxonomyId = useMemo(() => {
    // API may return the collection directly or wrapped in `data`
    const taxonomies = (taxonomiesData as any)?.data ?? taxonomiesData

    return (taxonomies as { id: number; key: string }[] | undefined)?.find(taxonomy => taxonomy.key === taxonomyKey)
      ?.id
  }, [taxonomiesData, taxonomyKey])

  const { data: termsData, isLoading: isLoadingTerms } = useFetch().useQuery(
    'get',
    '/terms',
    {
      params: {
        query: {
          ...queryParams,
          'filter[taxonomy_id]': taxonomyId
        }
      }
    },
    {
      // Lazy: terms are fetched only while the dropdown is open and taxonomy id is resolved
      enabled: open && !!taxonomyId
    }
  )

  const isLoading = isLoadingTaxonomies || isLoadingTerms

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = (event: React.ChangeEvent<{}>, reason: string) => {
    if (multiple && reason === 'selectOption') {
      return
    }

    setOpen(false)
  }

  const options = termsData?.data?.map(term => ({ value: term.id, label: term.title ?? '' }))

  return (
    <div className='flex items-center gap-x-2'>
      <MuiAutocomplete
        disabled={disabled}
        loadingText={keywordsTranslate?.loading}
        className='flex-grow'
        noOptionsText={keywordsTranslate?.noDataAvailable}
        open={open}
        onOpen={handleOpen}
        multiple={multiple}
        onClose={handleClose}
        isOptionEqualToValue={(option, value) => {
          const optionLabel = typeof option === 'string' ? option : (option as OptionType)?.value
          const valueLabel = typeof value === 'string' ? value : (value as OptionType)?.value

          return optionLabel === valueLabel
        }}
        getOptionLabel={option => (typeof option === 'string' ? option : (option as OptionType)?.label)}
        filterSelectedOptions={multiple ?? false}
        options={options ?? []}
        value={value}
        onChange={(_, data) => onChange?.(data)}
        loading={isLoading}
        renderInput={params => (
          <DebouncedInput
            {...params}
            error={error}
            label={label}
            value={queryParams?.filter?.search ?? ''}
            onChange={value =>
              setQueryParams(prev => ({
                ...prev,
                filter: {
                  ...prev.filter,
                  search: value
                }
              }))
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isLoading ? <CircularProgress color='inherit' size={20} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              )
            }}
          />
        )}
      />
    </div>
  )
}

export default TermsByTaxonomyAutocomplete
