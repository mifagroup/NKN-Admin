import React, { useState } from 'react'

import { CircularProgress, Autocomplete as MuiAutocomplete, TextField } from '@mui/material'

import { useGetDictionary } from '@/utils/useGetDictionary'
import { useFetch } from '@/utils/clientRequest'
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
  helperText?: string
}

const DoctorAutocomplete = ({
  error = false,
  multiple = false,
  label,
  value,
  onChange,
  disabled,
  helperText
}: IAutocompleteProps) => {
  // States
  const [open, setOpen] = useState(false)

  // Hooks
  const dictionary = useGetDictionary()
  const keywordsTranslate = dictionary?.keywords

  const { data: doctorsData, isLoading: isLoadingDoctors } = useFetch().useQuery('get', '/doctors')

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const options = ((doctorsData as any)?.data || []).map((doctor: any) => ({ 
    value: doctor.id, 
    label: doctor.full_name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim()
  }))

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
        loading={isLoadingDoctors}
        renderInput={params => (
          <TextField
            {...params}
            error={error}
            label={label}
            placeholder={`${keywordsTranslate?.select} ${label?.toLowerCase() || 'doctor'}...`}
            helperText={helperText}
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isLoadingDoctors ? <CircularProgress color='inherit' size={20} /> : null}
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

export default DoctorAutocomplete 
