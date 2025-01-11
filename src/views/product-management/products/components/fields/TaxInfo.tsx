import React, { useRef } from 'react'

import { FormControl, FormHelperText, Grid, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'

import { useGetDictionary } from '@/utils/useGetDictionary'
import AutoComplete, { type IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import type { productUpdateFormDataType } from '../../schema'

const TaxInfo = () => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const productTranslate = dictionary?.product_management.products

  const taxRef = useRef<IAutocompleteRef>(null)

  const { queryParams: taxesQueryParams, setQueryParams: setTaxesQueryParams } = useQueryParams()

  const { data: taxesData, isLoading: isLoadingTaxesData } = useFetch().useQuery('get', '/select/{model}', {
    params: {
      path: {
        model: 'tax'
      },
      query: {
        'filter[search]': taxesQueryParams.filter?.search
      }
    }
  })

  const {
    control,
    formState: { errors }
  } = useFormContext<productUpdateFormDataType>()

  return (
    <Grid container spacing={5}>
      <Grid item xs={12}>
        <Typography variant='button'>{productTranslate?.tax_settings}</Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <Controller
            name='tax_id'
            control={control}
            render={({ field }) => {
              return (
                <AutoComplete
                  {...field}
                  {...(errors.tax_id && {
                    error: true,
                    helperText: errors.tax_id.message
                  })}
                  open={false}
                  value={field.value}
                  onChange={(_, data) => field.onChange(data)}
                  ref={taxRef}
                  options={taxesData?.data ?? []}
                  loading={isLoadingTaxesData}
                  handleInputChange={value =>
                    setTaxesQueryParams(prevParams => ({
                      ...prevParams,
                      filter: {
                        ...prevParams.filter,
                        search: value
                      }
                    }))
                  }
                  inputValue={taxesQueryParams.filter?.search ?? ''}
                  label={keywordsTranslate?.taxGroup ?? ''}
                />
              )
            }}
          />
          {errors.tax_id && <FormHelperText error>{String(errors.tax_id?.message)}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default TaxInfo
