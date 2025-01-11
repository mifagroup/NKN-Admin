import React from 'react'

import { FormControl, FormHelperText, Grid, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import { useGetDictionary } from '@/utils/useGetDictionary'
import CategoryAutoComplete from '@/@core/components/categoryAutocomplete'
import Link from '@/components/Link'
import type { productUpdateFormDataType } from '../../schema'

const Categories: React.FC<{ attributeGroupId: number | undefined }> = ({ attributeGroupId }) => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const productTranslate = dictionary?.product_management.products

  const {
    control,
    formState: { errors }
  } = useFormContext<productUpdateFormDataType>()

  return (
    <Grid container spacing={5}>
      <Grid item xs={6}>
        <Typography variant='button'>{keywordsTranslate?.category}</Typography>
      </Grid>
      <Grid item xs={6} display={'flex'} justifyContent={'end'}>
        <Link className='underline'>{productTranslate?.category_help}</Link>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <Controller
            name={'category_id'}
            control={control}
            render={({ field }) => {
              return (
                <CategoryAutoComplete
                  type='product'
                  {...field}
                  {...(errors.category_id && {
                    error: true,
                    helperText: errors.category_id.message
                  })}
                  label={productTranslate?.main_category ?? ''}
                  value={field.value ?? { label: '', value: '' }}
                  onChange={value => field.onChange(value)}
                  addOption={false}
                />
              )
            }}
          />
          {errors.category_id && <FormHelperText error>{String(errors.category_id.message)}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <Controller
            name={'categories_id'}
            control={control}
            render={({ field }) => {
              return (
                <CategoryAutoComplete
                  type='product'
                  {...field}
                  {...(errors.categories_id && {
                    error: true,
                    helperText: errors.categories_id.message
                  })}
                  multiple
                  label={productTranslate?.other_categories ?? ''}
                  value={field.value ?? []}
                  onChange={value => field.onChange(value)}
                  addOption={false}
                  options={attributeGroupId ? `attribute_group_id=${attributeGroupId}` : ''}
                />
              )
            }}
          />
          {errors.categories_id && <FormHelperText error>{String(errors.categories_id.message)}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default Categories
