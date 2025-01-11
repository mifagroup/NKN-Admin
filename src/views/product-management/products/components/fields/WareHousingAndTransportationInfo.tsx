import React from 'react'

import { Grid, Tooltip, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import { useGetDictionary } from '@/utils/useGetDictionary'
import TextField from '@/@core/components/textField'
import { translateReplacer } from '@/utils/translateReplacer'
import type { productUpdateFormDataType } from '../../schema'

const WareHousingAndTransportationInfo = () => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const productTranslate = dictionary?.product_management.products

  const inputTranslate = dictionary?.input

  const {
    control,
    formState: { errors }
  } = useFormContext<productUpdateFormDataType>()

  return (
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='button'>{productTranslate?.warehousing_and_transportation}</Typography>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Controller
          name='stock'
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
                placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.quantity ?? '')}
                label={keywordsTranslate?.quantity}
                {...(errors.stock && { error: true, helperText: String(errors.stock.message) })}
                InputProps={{
                  endAdornment: (
                    <Tooltip title={keywordsTranslate?.quantity}>
                      <i className='ri-information-line text-[22px] text-textSecondary cursor-pointer' />
                    </Tooltip>
                  )
                }}
              />
            )
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Controller
          name='minimum_sale'
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
                  keywordsTranslate?.min_purchase ?? ''
                )}
                label={keywordsTranslate?.min_purchase}
                {...(errors.minimum_sale && { error: true, helperText: String(errors.minimum_sale.message) })}
                InputProps={{
                  endAdornment: (
                    <Tooltip title={keywordsTranslate?.min_purchase}>
                      <i className='ri-information-line text-[22px] text-textSecondary cursor-pointer' />
                    </Tooltip>
                  )
                }}
              />
            )
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Controller
          name='maximum_sale'
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
                  keywordsTranslate?.max_purchase ?? ''
                )}
                label={keywordsTranslate?.max_purchase}
                {...(errors.maximum_sale && { error: true, helperText: String(errors.maximum_sale.message) })}
                InputProps={{
                  endAdornment: (
                    <Tooltip title={keywordsTranslate?.max_purchase}>
                      <i className='ri-information-line text-[22px] text-textSecondary cursor-pointer' />
                    </Tooltip>
                  )
                }}
              />
            )
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Controller
          name='warning_quantity'
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
                  keywordsTranslate?.quantity_warning ?? ''
                )}
                label={keywordsTranslate?.quantity_warning}
                {...(errors.warning_quantity && { error: true, helperText: String(errors.warning_quantity.message) })}
                InputProps={{
                  endAdornment: (
                    <Tooltip title={keywordsTranslate?.quantity_warning}>
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

export default WareHousingAndTransportationInfo
