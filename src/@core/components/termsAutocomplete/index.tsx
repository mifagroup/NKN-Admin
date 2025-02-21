import React, { useState } from 'react'

import { CircularProgress, Autocomplete as MuiAutocomplete } from '@mui/material'

import { useGetDictionary } from '@/utils/useGetDictionary'
import DebouncedInput from '../custom-inputs/DebouncedInput'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import type { OptionType } from '@/@core/types'

type IAutocompleteProps = {
  error?: boolean
  label: string
  multiple?: boolean
  value?:
    | { value?: string | number | undefined; label?: string | undefined }
    | null
    | undefined
    | { value?: string | number | undefined; label?: string | undefined }[]
  onChange?: (data: any) => void
  disabled?: boolean
}

const ExpertiseAutocomplete = ({
  error = false,
  multiple = false,
  label,
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

  const { data: expertisesData, isLoading: isLoadingExpertises } = useFetch().useQuery('get', '/terms', {
    params: {
      query: {
        ...queryParams
      }
    }
  })

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const options = expertisesData?.data?.map(exp => ({ value: exp.id, label: exp.title ?? '' }))

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
        loading={isLoadingExpertises}
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
                  {isLoadingExpertises ? <CircularProgress color='inherit' size={20} /> : null}
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

export default ExpertiseAutocomplete
