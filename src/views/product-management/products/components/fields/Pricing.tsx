import React from 'react'

import { Grid, Typography } from '@mui/material'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { useGetDictionary } from '@/utils/useGetDictionary'
import TextField from '@/@core/components/textField'
import { translateReplacer } from '@/utils/translateReplacer'
import { useSplash } from '@/@core/hooks/useSplash'
import { commaSeparator } from '@/utils/commaSeparator'
import { handleRawValueChange } from '@/utils/handleRawValueChange'
import { type productUpdateFormDataType } from '../../schema'

const Pricing: React.FC<{}> = () => {
  const dictionary = useGetDictionary()

  const productTranslate = dictionary?.product_management.products

  const inputTranslate = dictionary?.input

  const pricingPlanTranslate = dictionary?.product_management.pricing_plans

  const splash = useSplash()

  const default_currency = splash?.currencies?.find(currency => currency.default?.value)

  const {
    control,
    formState: { errors },
    setValue
  } = useFormContext<productUpdateFormDataType>()

  const pricingListWatch: productUpdateFormDataType['simple_product']['pricing_plans'] = useWatch({
    name: 'pricing_plans'
  })

  const retailPriceWatch: productUpdateFormDataType['simple_product']['retail_price'] = useWatch({
    name: 'retail_price'
  })

  const wholesalePriceWatch: productUpdateFormDataType['simple_product']['wholesale_price'] = useWatch({
    name: 'wholesale_price'
  })

  return (
    <Grid container spacing={8}>
      <Grid item>
        <Grid container spacing={5}>
          <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
            <Typography variant='button'>{productTranslate?.pricing}</Typography>
            <Typography variant='subtitle2'>{productTranslate?.pricing_subtitle}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name='simple_product.retail_price'
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <TextField
                    {...field}
                    fullWidth
                    type='text'
                    value={field.value ? commaSeparator(field.value) : ''}
                    onChange={event => handleRawValueChange(event, field.onChange)}
                    placeholder={translateReplacer(
                      inputTranslate?.placeholder ?? '',
                      productTranslate?.retial_price ?? ''
                    )}
                    label={productTranslate?.retial_price ?? ''}
                    {...(errors?.simple_product?.retail_price && {
                      error: true,
                      helperText: String(errors.simple_product.retail_price.message)
                    })}
                  />
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name='simple_product.wholesale_price'
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                return (
                  <TextField
                    {...field}
                    fullWidth
                    type='text'
                    value={field.value ? commaSeparator(field.value) : ''}
                    onChange={event => handleRawValueChange(event, field.onChange)}
                    placeholder={translateReplacer(
                      inputTranslate?.placeholder ?? '',
                      productTranslate?.wholesale_price ?? ''
                    )}
                    label={productTranslate?.wholesale_price ?? ''}
                    {...(errors.simple_product?.wholesale_price && {
                      error: true,
                      helperText: String(errors.simple_product.wholesale_price.message)
                    })}
                  />
                )
              }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={5}>
          {pricingListWatch?.map((price, index: number) => {
            const application_placeholder = !price?.application_percent_changed
              ? price?.type === 'retail'
                ? (retailPriceWatch ?? 0) - ((retailPriceWatch ?? 0) * (price?.default_application_percent ?? 0)) / 100
                : price?.type === 'wholesale'
                  ? (wholesalePriceWatch ?? 0) -
                    ((wholesalePriceWatch ?? 0) * (price?.default_application_percent ?? 0)) / 100
                  : null
              : null

            const website_placeholder = !price?.website_percent_changed
              ? price?.type === 'retail'
                ? (retailPriceWatch ?? 0) - ((retailPriceWatch ?? 0) * (price?.default_website_percent ?? 0)) / 100
                : price?.type === 'wholesale'
                  ? (wholesalePriceWatch ?? 0) -
                    ((wholesalePriceWatch ?? 0) * (price?.default_website_percent ?? 0)) / 100
                  : null
              : null

            return (
              <Grid item xs={12} key={price.pricing_plan_id}>
                <Grid container spacing={5} alignItems={'center'}>
                  <Grid item xs={12} md={3} lg={2}>
                    <Typography variant='button' className='break-words'>
                      {price?.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} lg={5}>
                    <Controller
                      name={`simple_product.pricing_plans.${index}.application_percent`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => {
                        return (
                          <TextField
                            {...field}
                            fullWidth
                            type='text'
                            value={field.value ? commaSeparator(field.value) : ''}
                            onChange={event => {
                              handleRawValueChange(event, field.onChange)

                              if (event.target.value) {
                                setValue(`simple_product.pricing_plans.${index}.application_percent_changed`, true)
                              } else {
                                setValue(`simple_product.pricing_plans.${index}.application_percent_changed`, false)
                              }
                            }}
                            placeholder={
                              application_placeholder
                                ? application_placeholder.toString()
                                : translateReplacer(
                                    inputTranslate?.placeholder ?? '',
                                    pricingPlanTranslate?.application_price ?? ''
                                  )
                            }
                            label={pricingPlanTranslate?.application_price ?? ''}
                            InputProps={{
                              endAdornment: <Typography variant='subtitle2'>{default_currency?.symbol}</Typography>
                            }}
                          />
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} lg={5}>
                    <Controller
                      name={`simple_product.pricing_plans.${index}.website_percent`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => {
                        return (
                          <TextField
                            {...field}
                            fullWidth
                            type='text'
                            value={field.value ? commaSeparator(field.value) : ''}
                            onChange={event => handleRawValueChange(event, field.onChange)}
                            placeholder={
                              website_placeholder
                                ? website_placeholder.toString()
                                : translateReplacer(
                                    inputTranslate?.placeholder ?? '',
                                    pricingPlanTranslate?.website_price ?? ''
                                  )
                            }
                            label={pricingPlanTranslate?.website_price ?? ''}
                            InputProps={{
                              endAdornment: <Typography variant='subtitle2'>{default_currency?.symbol}</Typography>
                            }}
                          />
                        )
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )
          })}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default Pricing
