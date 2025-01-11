// React Imports
import React from 'react'

// Utils Imports
import MuiTextField, { type TextFieldProps } from '@mui/material/TextField'

type CustomTextFieldProps = TextFieldProps

const TextField: React.FC<CustomTextFieldProps> = ({ ...rest }) => {
  return (
    <MuiTextField
      inputProps={{
        maxLength: 255
      }}
      {...rest}
    />
  )
}

export default TextField
