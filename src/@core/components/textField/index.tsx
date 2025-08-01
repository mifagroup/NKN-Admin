// React Imports
import React from 'react'

// Utils Imports
import MuiTextField, { type TextFieldProps } from '@mui/material/TextField'

type CustomTextFieldProps = TextFieldProps

const TextField = React.forwardRef<HTMLInputElement, CustomTextFieldProps>(({ ...rest }, ref) => {
  return (
    <MuiTextField
      ref={ref}
      inputProps={{
        maxLength: 255
      }}
      {...rest}
    />
  )
})

TextField.displayName = 'TextField'

export default TextField
