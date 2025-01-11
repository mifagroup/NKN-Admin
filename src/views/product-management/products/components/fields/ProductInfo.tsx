import React from 'react'

import { FormControl, FormHelperText, Grid, InputLabel, Typography } from '@mui/material'

import { Controller, useFormContext } from 'react-hook-form'

import { useGetDictionary } from '@/utils/useGetDictionary'
import TextField from '@/@core/components/textField'
import { translateReplacer } from '@/utils/translateReplacer'
import TagAutocomplete from '@/@core/components/tagAutocomplete'
import UnitAutocomplete from '@/@core/components/unitAutocomplete'
import TextEditor from '@/@core/components/textEditor/TextEditor'
import type { productUpdateFormDataType } from '../../schema'

const ProductInfo = () => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const productTranslate = dictionary?.product_management.products

  const unitTranslate = dictionary?.settings?.unit

  const inputTranslate = dictionary?.input

  const editorTranslate = dictionary?.editor

  const {
    control,
    formState: { errors }
  } = useFormContext<productUpdateFormDataType>()

  return (
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='button'>{productTranslate?.product_information}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Controller
          name='title'
          control={control}
          rules={{ required: true }}
          render={({ field }) => {
            return (
              <TextField
                {...field}
                fullWidth
                autoFocus
                type='text'
                placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.name ?? '')}
                label={keywordsTranslate?.name}
                {...(errors.title && { error: true, helperText: String(errors.title.message) })}
              />
            )
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <Controller
            name={`tags`}
            control={control}
            render={({ field }) => {
              return (
                <TagAutocomplete
                  {...field}
                  {...(errors.tags && {
                    error: true,
                    helperText: errors.tags.message
                  })}
                  multiple
                  label={keywordsTranslate?.tags ?? ''}
                  value={field.value}
                  onChange={value => field.onChange(value)}
                  addOption={false}
                />
              )
            }}
          />
          {errors?.tags && <FormHelperText error>{String(errors?.tags.message)}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Controller
          name='simple_product.sku'
          control={control}
          rules={{ required: true }}
          render={({ field }) => {
            return (
              <TextField
                {...field}
                fullWidth
                type='text'
                placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.sku ?? '')}
                label={keywordsTranslate?.sku}
                {...(errors?.simple_product?.sku && {
                  error: true,
                  helperText: String(errors.simple_product.sku.message)
                })}
              />
            )
          }}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <FormControl fullWidth>
          <Controller
            name={`wholesale_unit_ids`}
            control={control}
            render={({ field }) => {
              return (
                <UnitAutocomplete
                  {...field}
                  {...(errors.wholesale_unit_ids && {
                    error: true,
                    helperText: errors.wholesale_unit_ids.message
                  })}
                  multiple
                  label={unitTranslate?.wholesale_unit ?? ''}
                  value={field.value ?? []}
                  onChange={value => field.onChange(value)}
                  addOption={false}
                  type='count'
                />
              )
            }}
          />
          {errors?.wholesale_unit_ids && (
            <FormHelperText error>{String(errors?.wholesale_unit_ids.message)}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <FormControl fullWidth>
          <Controller
            name={`retail_unit_ids`}
            control={control}
            render={({ field }) => {
              return (
                <UnitAutocomplete
                  {...field}
                  {...(errors.retail_unit_ids && {
                    error: true,
                    helperText: errors.retail_unit_ids.message
                  })}
                  multiple
                  label={unitTranslate?.retial_unit ?? ''}
                  value={field.value ?? []}
                  onChange={value => field.onChange(value)}
                  addOption={false}
                  type='count'
                />
              )
            }}
          />
          {errors?.retail_unit_ids && <FormHelperText error>{String(errors?.retail_unit_ids.message)}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Controller
          name='description'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              rows={3}
              type='text'
              multiline
              placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.description ?? '')}
              label={keywordsTranslate?.description}
              {...(errors.description && { error: true, helperText: String(errors.description.message) })}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
        <InputLabel>{keywordsTranslate?.fullDescription}</InputLabel>
        <Controller
          name='body'
          control={control}
          render={({ field }) => (
            <TextEditor
              placeholder={editorTranslate?.fullDescriptionPlaceholder}
              onChange={editor => field.onChange(editor.editor.getHTML())}
              value={field.value ?? ''}
            />
          )}
        />
        {errors.body && <FormHelperText error>{String(errors.body?.message)}</FormHelperText>}
      </Grid>
    </Grid>
  )
}

export default ProductInfo
