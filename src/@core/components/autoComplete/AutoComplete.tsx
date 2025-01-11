'use client'

// React Imports
import { forwardRef, useImperativeHandle, useState } from 'react'

// Third-party Imports
import { CircularProgress, Autocomplete as MuiAutocomplete } from '@mui/material'

// Type Imports

// Util Imports
import DebouncedInput from '../custom-inputs/DebouncedInput'
import { useGetDictionary } from '@/utils/useGetDictionary'
import type { OptionType } from '@/@core/types'
import TextField from '../textField'

export type IAutocompleteRef = {
  handleOpen: () => void
  handleClose: () => void
}

type IAutocompleteProps = {
  open: boolean
  onOpen?: () => void
  onClose?: () => void
  options: any
  loading?: boolean
  handleInputChange?: (value: string) => void
  inputValue?: string
  placeholder?: string
  error?: boolean
  label: string
} & Omit<React.ComponentProps<typeof MuiAutocomplete>, 'renderInput'>

// ForwardRef component
const AutoComplete = forwardRef<IAutocompleteRef, IAutocompleteProps>(
  (
    {
      open: propOpen,
      onOpen,
      onClose,
      options,
      loading,
      handleInputChange,
      inputValue,
      error = false,
      label,
      placeholder,
      ...rest
    },
    ref
  ) => {
    const [open, setOpen] = useState(propOpen)

    const dictionary = useGetDictionary()

    const keywordsDictionary = dictionary?.keywords

    useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose
    }))

    const handleOpen = () => {
      onOpen?.()
      setOpen(true)
    }

    const handleClose = () => {
      onClose?.()
      setOpen(false)
    }

    // useEffect(() => {
    //   if (!!inputValue && !rest.value) {
    //     handleInputChange('')
    //   }

    //   // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [open, rest.value])

    return (
      <MuiAutocomplete
        {...rest}
        loadingText={keywordsDictionary?.loading}
        noOptionsText={keywordsDictionary?.noDataAvailable}
        open={open ?? false}
        onOpen={handleOpen}
        onClose={handleClose}
        isOptionEqualToValue={(option, value) => {
          const optionLabel = typeof option === 'string' ? option : (option as OptionType)?.value
          const valueLabel = typeof value === 'string' ? value : (value as OptionType)?.value

          return optionLabel === valueLabel
        }}
        getOptionLabel={option => (typeof option === 'string' ? option : (option as OptionType)?.label)}
        filterSelectedOptions={rest.multiple ?? false}
        options={options}
        loading={loading}
        renderInput={params => {
          if (!rest.freeSolo) {
            return (
              <DebouncedInput
                {...params}
                error={error}
                value={inputValue ?? ''}
                label={label}
                onChange={handleInputChange}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color='inherit' size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
                size='medium'
              />
            )
          } else {
            return <TextField {...params} variant='outlined' label={label} placeholder={placeholder} />
          }
        }}
      />
    )
  }
)

export default AutoComplete
