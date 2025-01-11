import React from 'react'

import { Grid, Tooltip, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import { useGetDictionary } from '@/utils/useGetDictionary'
import TextField from '@/@core/components/textField'
import { translateReplacer } from '@/utils/translateReplacer'
import type { productUpdateFormDataType } from '../../schema'

const DiscountInfo = () => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const inputTranslate = dictionary?.input

  const productTranslate = dictionary?.product_management.products

  const {
    control,
    formState: { errors }
  } = useFormContext<productUpdateFormDataType>()

  return (
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='button'>{productTranslate?.discount_settings}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Controller
          name='max_discount_percent'
          control={control}
          rules={{ required: true }}
          render={({ field }) => {
            return (
              <TextField
                {...field}
                fullWidth
                type='number'
                value={!!field.value ? field.value : undefined}
                onChange={event => field.onChange(+event.target.value)}
                placeholder={translateReplacer(
                  inputTranslate?.placeholder ?? '',
                  keywordsTranslate?.max_discount_percent ?? ''
                )}
                label={keywordsTranslate?.max_discount_percent}
                {...(errors.max_discount_percent && {
                  error: true,
                  helperText: String(errors.max_discount_percent.message)
                })}
                InputProps={{
                  endAdornment: (
                    <Tooltip title={keywordsTranslate?.max_discount_percent}>
                      <i className='ri-information-line text-[22px] text-textSecondary cursor-pointer' />
                    </Tooltip>
                  )
                }}
              />
            )
          }}
        />
      </Grid>
    </Grid>
  )
}

export default DiscountInfo
