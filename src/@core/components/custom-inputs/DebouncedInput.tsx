'use client'

// React Imports
import { useEffect, useState } from 'react'

// third-party imports
import { useDebounce } from 'use-debounce'

// MUI Imports
import type { TextFieldProps } from '@mui/material/TextField'

import TextField from '../textField'

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string
  onChange?: (value: string) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  const [debouncedValue] = useDebounce(value, debounce)

  // Update the internal state only if the initial value changes
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Call onChange when the debounced value changes
  useEffect(() => {
    // if (debouncedValue !== initialValue) {
    onChange && onChange(debouncedValue)

    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  return <TextField value={value} onChange={e => setValue(e.target.value)} size='small' {...props} />
}

export default DebouncedInput
