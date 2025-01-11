import React from 'react'

import { Grid, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import { useGetDictionary } from '@/utils/useGetDictionary'
import TextField from '@/@core/components/textField'
import { translateReplacer } from '@/utils/translateReplacer'
import { useSplash } from '@/@core/hooks/useSplash'
import type { productUpdateFormDataType } from '../../schema'

const Dimentions = () => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const productTranslate = dictionary?.product_management.products

  const inputTranslate = dictionary?.input

  const splash = useSplash()

  const default_weight_unit = splash?.default_weight_unit

  const default_length_unit = splash?.default_length_unit

  const {
    control,
    formState: { errors }
  } = useFormContext<productUpdateFormDataType>()

  return (
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='button'>{productTranslate?.dimention_and_weight}</Typography>
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Controller
          name='simple_product.sku'
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
                placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.weight ?? '')}
                label={keywordsTranslate?.weight}
                {...(errors?.simple_product?.sku && {
                  error: true,
                  helperText: String(errors.simple_product?.sku.message)
                })}
                InputProps={{
                  endAdornment: <Typography>{default_weight_unit?.title}</Typography>
                }}
              />
            )
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Controller
          name='simple_product.length'
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
                placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.length ?? '')}
                label={keywordsTranslate?.length}
                {...(errors?.simple_product?.length && {
                  error: true,
                  helperText: String(errors?.simple_product.length.message)
                })}
                InputProps={{
                  endAdornment: <Typography>{default_length_unit?.title}</Typography>
                }}
              />
            )
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Controller
          name='simple_product.width'
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
                placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.width ?? '')}
                label={keywordsTranslate?.width}
                {...(errors?.simple_product?.width && {
                  error: true,
                  helperText: String(errors?.simple_product?.width.message)
                })}
                InputProps={{
                  endAdornment: <Typography>{default_length_unit?.title}</Typography>
                }}
              />
            )
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={3}>
        <Controller
          name='simple_product.height'
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
                placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.height ?? '')}
                label={keywordsTranslate?.height}
                {...(errors?.simple_product?.height && {
                  error: true,
                  helperText: String(errors.simple_product?.height.message)
                })}
                InputProps={{
                  endAdornment: <Typography>{default_length_unit?.title}</Typography>
                }}
              />
            )
          }}
        />
      </Grid>
    </Grid>
  )
}

export default Dimentions
