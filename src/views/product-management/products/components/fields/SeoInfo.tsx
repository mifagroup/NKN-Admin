import React, { useRef } from 'react'

import { Chip, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { isBefore, startOfDay } from 'date-fns'

import { useGetDictionary } from '@/utils/useGetDictionary'
import { useStatuses } from '@/@core/hooks/useStatuses'
import DatePicker from '@/@core/components/datePicker/DatePicker'
import TextField from '@/@core/components/textField'
import { translateReplacer } from '@/utils/translateReplacer'
import AutoComplete, { type IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'
import { formatStringToArray } from '@/utils/formatStringToArray'
import { formatArrayToString } from '@/utils/formatArrayToString'
import BrandAutocomplete from '@/@core/components/brandAutocomplete'
import type { productUpdateFormDataType } from '../../schema'

const SeoInfo = () => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const productTranslate = dictionary?.product_management.products

  const inputTranslate = dictionary?.input

  const keywordsRef = useRef<IAutocompleteRef>(null)

  const statuses = useStatuses()

  const {
    control,
    formState: { errors },
    setValue
  } = useFormContext<productUpdateFormDataType>()

  const publishWatch = useWatch({ name: 'published' })

  return (
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='button'>{productTranslate?.seo_content_settings}</Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <Controller
            name='brand_id'
            control={control}
            render={({ field }) => {
              return (
                <BrandAutocomplete
                  {...field}
                  {...(errors.brand_id && { error: true, helperText: errors.brand_id.message })}
                  label={keywordsTranslate?.brand ?? ''}
                  value={field.value ?? { label: '', value: '' }}
                  onChange={value => field.onChange(value)}
                  addOption={false}
                />
              )
            }}
          />
          {errors.brand_id && <FormHelperText error>{String(errors.brand_id?.message)}</FormHelperText>}
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.published}>
          <InputLabel>{keywordsTranslate?.status}</InputLabel>
          <Controller
            name='published'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                label={keywordsTranslate?.status}
                {...field}
                value={field.value ?? '1'}
                onChange={event => {
                  field.onChange(event)
                  setValue('published_at', new Date().toUTCString())
                }}
              >
                {statuses?.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          {errors.published && <FormHelperText error>{String(errors.published?.message)}</FormHelperText>}
        </FormControl>
      </Grid>

      {!+publishWatch && (
        <Grid item xs={12}>
          <Controller
            name='published_at'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DatePicker
                onChange={value => field.onChange(value?.toUTCString())}
                value={field.value ? new Date(field.value) : null}
                label={keywordsTranslate?.publish_date}
                shouldDisableDate={date => isBefore(date, startOfDay(new Date()))}
                {...(errors.published_at && { error: true, helperText: errors.published_at.message })}
                className='w-full'
              />
            )}
          />
          {errors.published_at && <FormHelperText error>{String(errors.published_at?.message)}</FormHelperText>}
        </Grid>
      )}

      <Grid item xs={12}>
        <Controller
          name='seo_title'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type='text'
              placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.title ?? '')}
              label={keywordsTranslate?.title}
              {...(errors?.seo_title && { error: true, helperText: String(errors?.seo_title?.message) })}
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Controller
          name='seo_description'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={3}
              type='text'
              placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.description ?? '')}
              label={keywordsTranslate?.description}
              {...(errors?.seo_description && {
                error: true,
                helperText: String(errors?.seo_description?.message)
              })}
            />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <Controller
            name='seo_keywords'
            control={control}
            render={({ field }) => {
              return (
                <AutoComplete
                  {...field}
                  {...(errors.seo_keywords && { error: true, helperText: errors.seo_keywords.message })}
                  open={false}
                  freeSolo={true}
                  value={field.value ? formatStringToArray(field.value) : []}
                  onChange={(_, data) => field.onChange(formatArrayToString(data as string[]))}
                  ref={keywordsRef}
                  options={[]}
                  label={keywordsTranslate?.keywords ?? ''}
                  placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.keywords ?? '')}
                  multiple
                  renderTags={(value: any, getTagProps) => {
                    return value?.map((option: string, index: number) => {
                      const { key, ...tagProps } = getTagProps({ index })

                      return <Chip variant='outlined' label={option} key={key} {...tagProps} />
                    })
                  }}
                />
              )
            }}
          />
          {errors.seo_keywords && <FormHelperText error>{String(errors.seo_keywords?.message)}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default SeoInfo
