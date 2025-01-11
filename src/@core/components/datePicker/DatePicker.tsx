'use client'

// Next Imports
import { useParams } from 'next/navigation'

// Utils Imports
import { type DateTimePickerProps, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalaliV3'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { DateTimePicker as MuiDatePicker } from '@mui/x-date-pickers/DateTimePicker'

const DatePicker: React.FC<DateTimePickerProps<Date> & { error?: any }> = props => {
  const { lang } = useParams()

  return (
    <LocalizationProvider dateAdapter={lang === 'fa' ? AdapterDateFnsJalali : AdapterDateFns}>
      <MuiDatePicker
        {...props}
        slotProps={{
          field: {
            readOnly: true
          },
          textField: {
            error: props.error,
            helperText: props.error?.message
          }
        }}
      />
    </LocalizationProvider>
  )
}

export default DatePicker
