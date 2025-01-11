import React, { useRef } from 'react'

import { Checkbox, FormControl, FormControlLabel, Grid, Tooltip, Typography } from '@mui/material'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { useGetDictionary } from '@/utils/useGetDictionary'
import { type components } from '@/@core/api/v1'
import type { IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'
import AutoComplete from '@/@core/components/autoComplete/AutoComplete'
import { type productUpdateFormDataType } from '../../schema'

const Attributes: React.FC<{ attributes: components['schemas']['ProductInterfaceDetailResource']['attributes'] }> = ({
  attributes
}) => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const productTranslate = dictionary?.product_management.products

  const attributesRef = useRef<IAutocompleteRef>(null)

  const {
    control,
    formState: {}
  } = useFormContext<productUpdateFormDataType>()

  const attributesWatch: productUpdateFormDataType['attributes'] = useWatch({ name: 'attributes' })

  return (
    <Grid container spacing={8}>
      <Grid item xs={12}>
        <Grid container spacing={5}>
          <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
            <Typography variant='button'>{keywordsTranslate?.attributes}</Typography>
            <Typography variant='subtitle2'>{productTranslate?.attribute_subtitle}</Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={5}>
          {attributesWatch?.map((attr, index: number) => (
            <Grid item xs={12} key={attr.attribute_id}>
              <Grid container spacing={5} alignItems={'center'}>
                <Grid item xs={12} md={3} lg={1}>
                  <Typography variant='button' className='break-words'>
                    {attributes?.[index].title}
                  </Typography>
                </Grid>
                <Grid item xs={12} lg={5}>
                  <FormControl fullWidth>
                    <Controller
                      name={`attributes.${index}.values`}
                      control={control}
                      render={({ field }) => {
                        return (
                          <AutoComplete
                            {...field}
                            open={false}
                            value={field.value ?? []}
                            multiple
                            onChange={(_, data) => {
                              field.onChange(data)
                            }}
                            ref={attributesRef}
                            options={
                              attributes?.[index]?.values?.map(attr => ({ value: attr.id, label: attr.title })) ?? []
                            }
                            label={`${keywordsTranslate?.attribute_values}`}
                          />
                        )
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={3}>
                  <Controller
                    name={`attributes.${index}.special`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <div className='flex items-center justify-between'>
                        <FormControlLabel
                          {...field}
                          checked={field.value ?? false}
                          control={<Checkbox />}
                          label={keywordsTranslate?.special_attribute}
                        />
                        <Tooltip title={keywordsTranslate?.special_attribute}>
                          <i className='ri-information-line text-[22px] text-textSecondary' />
                        </Tooltip>
                      </div>
                    )}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Controller
                    name={`attributes.${index}.codding`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <div className='flex items-center justify-between'>
                        <FormControlLabel
                          {...field}
                          control={<Checkbox />}
                          checked={field.value ?? false}
                          label={keywordsTranslate?.use_in_codding}
                        />
                        <Tooltip title={keywordsTranslate?.use_in_codding}>
                          <i className='ri-information-line text-[22px] text-textSecondary' />
                        </Tooltip>
                      </div>
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Attributes
