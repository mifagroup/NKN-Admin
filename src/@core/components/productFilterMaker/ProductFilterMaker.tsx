'use client'

// React Imports
import React, { useEffect, useState } from 'react'

// Utils Imports
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  Pagination,
  Skeleton,
  Typography,
  type TextFieldProps
} from '@mui/material'

import TextField from '../textField'
import { useGetDictionary } from '@/utils/useGetDictionary'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import { useFetch } from '@/utils/clientRequest'
import AutoComplete from '../autoComplete/AutoComplete'
import type { operations } from '@/@core/api/v1'
import { translateReplacer } from '@/utils/translateReplacer'
import type { OptionType } from '@/@core/types'
import CategoryAutoComplete from '../categoryAutocomplete'
import Image from '../image'
import DebouncedSlider from '../debouncedSlider'

type ProductFilterMakerProps = {
  setFilterUrl: (url: string) => void
  filterUrl: string
} & TextFieldProps

const ProductFilterMaker: React.FC<ProductFilterMakerProps> = props => {
  const { setFilterUrl, filterUrl, ...restProps } = props

  const [openFilters, setOpenFilters] = useState(false)

  const dictionary = useGetDictionary()

  const productFilterMakerTranslate = dictionary?.product_filter_maker

  const keywordsTranslate = dictionary?.keywords

  const inputTranslate = dictionary?.input

  const { queryParams, setQueryParams } = useQueryParams<operations['adaptiveFilter']['parameters']['query']>(12)

  const { data, isLoading } = useFetch().useQuery(
    'get',
    '/adaptive-filter',
    {
      params: {
        query: {
          'with-products': 1,
          per_page: queryParams.per_page,
          ...queryParams
        }
      }
    },
    {
      enabled: openFilters
    }
  )

  useEffect(() => {
    if (data?.data?.price_range && data?.data?.price_range?.min && data?.data?.price_range?.max) {
      setQueryParams(prev => ({
        ...prev,
        'filter[price]': `${+(data?.data?.price_range?.min ?? '')},${+(data?.data?.price_range?.max ?? '')}`
      }))
    }
  }, [data?.data?.price_range])

  const products = data?.data?.products?.data

  const productsMeta = data?.data?.products?.meta

  const categories = (
    <CategoryAutoComplete
      label={`${keywordsTranslate?.category}`}
      value={data?.data?.categories?.find(
        category =>
          category.value === (queryParams?.['filter[category]'] ? Number(queryParams?.['filter[category]']) : undefined)
      )}
      onChange={data =>
        setQueryParams(() => ({
          'with-products': 1,
          per_page: 12,
          page: 1,
          'filter[category]': (data as OptionType)?.value.toString()
        }))
      }
      addOption={false}
    />
  )

  const brands = isLoading ? (
    <Skeleton variant='rounded' height={56} />
  ) : data?.data?.brands?.length ? (
    <AutoComplete
      open={false}
      multiple
      value={data?.data?.brands.filter(brand =>
        (queryParams?.['filter[brand]'] ?? '').split(',').includes((brand?.value ?? '').toString())
      )}
      onChange={(_, selectedItems) => {
        // Update queryParams based on selected items
        setQueryParams(prev => {
          const newFilterValues = (selectedItems as OptionType[])
            ?.map(item => item?.value?.toString()) // Convert selected values to strings
            .filter(Boolean) // Remove undefined or null values
            .join(',') // Join into a comma-separated string

          return {
            ...prev,
            'filter[brand]': newFilterValues || '' // Set to empty string if no items selected
          }
        })
      }}
      options={data.data.brands}
      label={`${keywordsTranslate?.brand}`}
      placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.brand ?? '')}
    />
  ) : null

  const attributes = isLoading ? (
    <Skeleton variant='rounded' height={56} />
  ) : data?.data?.attributes?.length ? (
    <AutoComplete
      open={false}
      multiple
      value={data?.data?.attributes
        ?.flatMap(attr => attr.values)
        .filter(attr => (queryParams?.['filter[attribute]'] ?? '').split(',').includes((attr?.value ?? '').toString()))}
      onChange={(_, selectedItems) => {
        // Update queryParams based on selected items
        setQueryParams(prev => {
          const newFilterValues = (selectedItems as OptionType[])
            ?.map(item => item?.value?.toString()) // Convert selected values to strings
            .filter(Boolean) // Remove undefined or null values
            .join(',') // Join into a comma-separated string

          return {
            ...prev,
            'filter[attribute]': newFilterValues || '' // Set to empty string if no items selected
          }
        })
      }}
      options={data.data.attributes?.flatMap(attr => attr.values)}
      label={`${keywordsTranslate?.attribute}`}
      placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.attribute ?? '')}
    />
  ) : null

  const sorts = isLoading ? (
    <Skeleton variant='rounded' height={56} />
  ) : data?.data?.sorts?.length ? (
    <AutoComplete
      open={false}
      value={data.data.sorts.find(sort => sort.value === (queryParams?.['sort'] ? queryParams?.['sort'] : undefined))}
      onChange={(_, data) => setQueryParams(prev => ({ ...prev, sort: (data as OptionType)?.value as any }))}
      options={data.data.sorts}
      label={`${keywordsTranslate?.sort}`}
      placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.sort ?? '')}
    />
  ) : null

  const priceRange = isLoading ? (
    <Skeleton variant='rounded' height={56} />
  ) : data?.data?.price_range && data?.data?.price_range?.min && data?.data?.price_range?.max ? (
    <DebouncedSlider
      value={queryParams['filter[price]']?.split(',').map(value => +value) as number[]}
      min={+data?.data?.price_range?.min}
      max={+data?.data?.price_range?.max}
      onChange={value => {
        if (value?.length) {
          setQueryParams(prev => ({
            ...prev,
            'filter[price]': `${value[0]},${value[1]}`
          }))
        }
      }}
    />
  ) : null

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setQueryParams(prev => ({
      ...prev,
      page // Update the page in queryParams
    }))
  }

  const handleCloseFilters = () => {
    setOpenFilters(false)
  }

  const handleOpenFilters = () => {
    setOpenFilters(true)
  }

  const handleSaveFilter = () => {
    setOpenFilters(false)
    setFilterUrl(data?.data?.url ?? '')
  }

  return (
    <>
      <TextField
        {...restProps}
        fullWidth
        type='url'
        InputProps={{
          readOnly: true
        }}
        onClick={handleOpenFilters}
        value={filterUrl}
      />
      <Dialog open={openFilters} fullScreen>
        <DialogTitle borderBottom={1} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <span>{productFilterMakerTranslate?.title}</span>
          <div className='flex items-center gap-x-2'>
            <Button onClick={handleSaveFilter} variant='contained' disabled={isLoading}>
              {keywordsTranslate?.save}
            </Button>
            <IconButton onClick={handleCloseFilters}>
              <i className='ri-close-circle-line' />
            </IconButton>
          </div>
        </DialogTitle>

        <div className='h-full grid grid-cols-4 gap-5 p-5'>
          <div className='lg:col-span-1 col-span-4'>
            <div className='border p-5 rounded-md flex flex-col gap-y-5 h-full'>
              <Typography fontSize={'h5.fontSize'} fontWeight={'bold'}>
                {keywordsTranslate?.filters}
              </Typography>
              {categories}
              {brands}
              {attributes}
              {sorts}
              {priceRange}
            </div>
          </div>
          <div className='lg:col-span-3 col-span-4'>
            <div className='grid grid-cols-4 gap-5'>
              {isLoading ? (
                <>
                  {[...Array(4)]?.map(index => (
                    <Skeleton
                      key={index}
                      sx={{
                        height: 230,
                        transform: 'none'
                      }}
                      className='lg:col-span-1 md:col-span-2 col-span-4'
                    />
                  ))}
                </>
              ) : (
                products?.map(product => (
                  <div
                    key={product.id}
                    className='border p-2 rounded-md flex flex-col gap-y-3 h-fit lg:col-span-1 md:col-span-2 col-span-4'
                  >
                    <Image
                      src={product.image?.original_url ?? ''}
                      height={180}
                      width={180}
                      alt='product-image'
                      className='rounded-md min-h-[180px] w-full object-cover'
                    />
                    <div className='flex justify-between items-center'>
                      <Typography fontWeight={600}>{`product.title`}</Typography>
                      <Typography fontWeight={600}>
                        {product.price?.formatted} {product.price?.symbol}
                      </Typography>
                    </div>
                  </div>
                ))
              )}
            </div>
            {(productsMeta?.last_page ?? 1) > 1 && (
              <Box mt={4} display='flex' justifyContent='center'>
                <Pagination
                  count={productsMeta?.last_page}
                  page={queryParams.page || 1}
                  onChange={handlePageChange}
                  color='primary'
                />
              </Box>
            )}
          </div>
        </div>
      </Dialog>
    </>
  )
}

export default ProductFilterMaker
