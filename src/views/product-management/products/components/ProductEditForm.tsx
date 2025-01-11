'use client'
import type { SyntheticEvent } from 'react'
import React, { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Card, CardContent, Grid, LinearProgress, Tab, Typography } from '@mui/material'
import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import LoadingButton from '@mui/lab/LoadingButton'

import { zodResolver } from '@hookform/resolvers/zod'

import TabContext from '@mui/lab/TabContext'

import TabList from '@mui/lab/TabList'

import TabPanel from '@mui/lab/TabPanel'

import { toast } from 'react-toastify'

import { type getDictionary } from '@/utils/getDictionary'
import { useFetch } from '@/utils/clientRequest'
import Image from '@/@core/components/image'
import CustomIconButton from '@/@core/components/mui/IconButton'
import {
  Attributes,
  Categories,
  Dimentions,
  Pricing,
  ProductInfo,
  SeoInfo,
  TaxInfo,
  WareHousingAndTransportationInfo
} from './fields'
import type { productUpdateFormDataType } from '../schema'
import { productUpdateSchema } from '../schema'
import { setFormErrors } from '@/utils/setFormErrors'
import { menuUrls } from '@/@menu/utils/menuUrls'
import DiscountInfo from './fields/DiscountInfo'
import type { operations } from '@/@core/api/v1'

const ProductEditForm = ({
  dictionary,
  id
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  id?: number
}) => {
  const router = useRouter()

  const [tabValue, setTabValue] = useState<string>('1')

  const keywordsTranslate = dictionary?.keywords

  const productTranslate = dictionary?.product_management.products

  const { data: singleProductData, isLoading: isLoadingSingleProductData } = useFetch().useQuery(
    'get',
    '/product-interface/{productInterface}',
    {
      params: {
        path: {
          productInterface: id ?? 0
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleProduct = singleProductData?.data

  useEffect(() => {
    if (singleProduct) {
      setValue('title', singleProduct.title)

      setValue(
        'tags',
        singleProduct.tags?.map(tag => ({ label: tag.name, value: tag.name }))
      )

      setValue('simple_product.sku', singleProduct.main_product?.sku ?? '')

      setValue('slug', singleProduct.slug ?? '')

      setValue('description', singleProduct.description ?? '')

      setValue('body', singleProduct.body ?? '')

      setValue('category_id', { label: singleProduct?.category?.title, value: singleProduct?.category?.id })

      setValue(
        'categories_id',
        singleProduct.categories?.map(category => ({ label: category.title, value: category.id }))
      )

      setValue(
        'tax_id',
        singleProduct?.tax ? { label: singleProduct?.tax?.title, value: singleProduct?.tax?.id } : undefined
      )

      setValue('simple_product.published', singleProduct.published?.value ? '1' : '0')

      setValue('published_at', singleProduct.published_at ?? '')

      setValue('seo_title', singleProduct.seo_title ?? '')

      setValue('seo_description', singleProduct.seo_description ?? '')

      setValue('seo_keywords', singleProduct.seo_keywords ?? '')

      if (singleProduct.retail_units?.length)
        setValue(
          'retail_unit_ids',
          singleProduct.retail_units.map(unit => ({ label: unit.title, value: unit.id }))
        )

      if (singleProduct.wholesale_units?.length)
        setValue(
          'wholesale_unit_ids',
          singleProduct.wholesale_units.map(unit => ({ label: unit.title, value: unit.id }))
        )

      if (singleProduct.brand)
        setValue('brand_id', { label: singleProduct?.brand?.title, value: singleProduct?.brand?.id })

      if (singleProduct.tax) setValue('tax_id', { label: singleProduct?.tax?.title, value: singleProduct?.tax?.id })

      if (singleProduct?.attributes?.length) {
        setValue(
          'attributes',
          singleProduct.attributes.map(attr => ({
            attribute_id: attr.id,
            codding: attr.codding,
            special: attr.special,
            values: attr.values
              ? attr.values?.filter(value => value.selected)?.map(value => ({ value: value.id, label: value.title }))
              : []
          }))
        )
      }

      setValue('simple_product.retail_price', singleProduct.main_product?.retail_price?.value)

      setValue('simple_product.wholesale_price', singleProduct.main_product?.wholesale_price?.value)

      setValue(
        'simple_product.pricing_plans',
        singleProduct?.main_product?.price_list?.map(price => ({
          pricing_plan_id: price.id,
          title: price.title,
          default_application_percent: !price?.application_percent?.changed
            ? price.application_percent?.price
            : undefined,
          default_website_percent: !price?.website_percent?.changed ? price.website_percent?.price : undefined,
          application_percent: price?.application_percent?.changed ? price.application_percent?.price : undefined,
          website_percent: price?.website_percent?.changed ? price.website_percent?.price : undefined,
          application_percent_changed: price?.application_percent?.changed,
          website_percent_changed: price?.website_percent?.changed,
          type: price.type?.value
        })) ?? []
      )

      setValue('slug', singleProduct.slug ?? '')

      setValue('type', { label: singleProduct.type?.label, value: singleProduct.type?.value ?? 'simple' })

      setValue('simple_product.stock', singleProduct.main_product?.stock)

      setValue('simple_product.minimum_sale', singleProduct.main_product?.minimum_sale ?? 0)

      setValue('simple_product.maximum_sale', singleProduct.main_product?.maximum_sale ?? 0)

      setValue('warning_quantity', singleProduct.warning_quantity ?? 0)

      setValue('max_discount_percent', singleProduct.max_discount_percent ?? 0)

      setValue(
        'simple_product.width',
        singleProduct.main_product?.width ? +singleProduct.main_product?.width : undefined
      )

      setValue(
        'simple_product.height',
        singleProduct.main_product?.height ? +singleProduct.main_product?.height : undefined
      )

      setValue(
        'simple_product.length',
        singleProduct.main_product?.length ? +singleProduct.main_product?.length : undefined
      )

      setValue(
        'simple_product.weight',
        singleProduct.main_product?.weight ? +singleProduct.main_product?.weight : undefined
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleProduct])

  const { mutateAsync: editProduct, isPending: isEditingProduct } = useFetch().useMutation(
    'put',
    '/product-interface/{productInterface}'
  )

  const methods = useForm<productUpdateFormDataType>({
    resolver: zodResolver(productUpdateSchema(dictionary)),
    defaultValues: {}
  })

  const {
    setValue,
    setError,
    handleSubmit,
    formState: { errors }
  } = methods

  console.log(errors)

  const onSubmit: SubmitHandler<productUpdateFormDataType> = async (data: productUpdateFormDataType) => {
    const body: operations['updateProductInterface']['requestBody']['content']['application/json'] = {
      title: data.title,
      description: data.description ?? '',
      seo_title: data.seo_title ?? '',
      seo_description: data.seo_description ?? '',
      seo_keywords: data.seo_keywords ?? '',
      body: data.body ?? '',
      tax_id: data.tax_id?.value ?? 0,
      retail_unit_ids: data.retail_unit_ids?.map(unit => (unit.value ? +unit.value : 0)) ?? [],
      wholesale_unit_ids: data.retail_unit_ids?.map(unit => (unit.value ? +unit.value : 0)) ?? [],
      brand_id: data.brand_id?.value ?? 0,
      category_id: data.category_id?.value ?? 0,
      categories_id: data.categories_id?.map(category => (category.value ? +category.value : 0)) ?? [],
      slug: data.slug ?? '',
      type: data.type?.value ?? '',
      warning_quantity: data?.warning_quantity ?? 0,
      max_discount_percent: data?.max_discount_percent ?? 0,
      published: data.simple_product.published === '1' ? 1 : 0,
      published_at: (data?.published_at as string) ?? '',
      tags: data.tags?.map(tag => tag.value?.toString() ?? '') ?? [],
      attributes:
        data.attributes?.map(attr => ({
          attribute_id: attr.attribute_id,
          codding: attr.codding,
          special: attr.special,
          values: attr.values?.map(value => (value.value ? value.value : 0)) ?? []
        })) ?? [],
      simple_product: {
        width: data.simple_product.width ? +data.simple_product.width : 0,
        length: data.simple_product.length ? +data.simple_product.length : 0,
        maximum_sale: data?.simple_product.maximum_sale ?? 0,
        height: data.simple_product.height ? +data.simple_product.height : 0,
        wholesale_price: data?.simple_product.wholesale_price ?? 0,
        retail_price: data?.simple_product.retail_price ?? 0,
        published: data.simple_product.published === '1' ? true : false,
        pricing_plans: data.simple_product.pricing_plans?.map(plan => ({
          pricing_plan_id: plan.pricing_plan_id ?? 0,
          application_percent: plan.application_percent ?? null,
          website_percent: plan.website_percent ?? null
        })),
        stock: data.simple_product.stock ?? 0,
        minimum_sale: data?.simple_product.minimum_sale ?? 0,
        weight: data.simple_product.weight ? +data.simple_product.weight : 0,
        sku: data.simple_product.sku ?? null
      }
    }

    await editProduct({
      body,
      params: {
        path: {
          productInterface: id ?? 0
        }
      }
    })
      .then(res => {
        toast.success(res.message)
        router.push(menuUrls.product_management?.products?.list)
      })
      .catch(e => {
        setFormErrors(e, setError)
      })
  }

  const handleChangeTab = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  if (id && isLoadingSingleProductData) {
    return <LinearProgress />
  }

  return (
    <FormProvider {...methods}>
      <Grid container spacing={6}>
        <Grid xs={12} item>
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
            <Grid spacing={6} container>
              <Grid item xs={12}>
                <div className='flex flex-wrap sm:items-center justify-between max-sm:flex-col gap-6'>
                  <div>
                    <Typography variant='h4' className='mbe-1'>
                      {productTranslate.edit_product_title}
                    </Typography>
                  </div>
                  <div className='flex flex-wrap max-sm:flex-col gap-4'>
                    <LoadingButton variant='contained' type='submit' loading={isEditingProduct}>
                      {keywordsTranslate.save}
                    </LoadingButton>
                  </div>
                </div>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Grid container spacing={5}>
                      <Grid item xs={12}>
                        <div className='flex items-center gap-x-4'>
                          <Image
                            src={singleProduct?.images?.find(image => image.primary)?.original_url ?? ''}
                            alt='product-image'
                            width={64}
                            height={64}
                            className='rounded-full'
                          />
                          <div className='flex flex-col'>
                            <Typography variant='button'>{singleProduct?.title}</Typography>
                            <div className='flex items-center gap-x-3'>
                              <Typography variant='subtitle2'>{singleProduct?.type?.label}</Typography>
                              <CustomIconButton size='small' title={keywordsTranslate.edit}>
                                <i className='ri-edit-box-line text-[22px] text-textSecondary' />
                              </CustomIconButton>
                            </div>
                          </div>
                        </div>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <TabContext value={tabValue}>
                  <TabList onChange={handleChangeTab}>
                    <Tab value='1' label='اطلاعات کلی' />
                    <Tab value='2' label='گالری و ویدیو' />
                  </TabList>
                  <TabPanel value='1'>
                    <Grid container spacing={5}>
                      <Grid item xs={12} lg={8} display={'flex'} flexDirection={'column'} rowGap={5}>
                        <Card>
                          <CardContent>
                            <ProductInfo />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent>
                            <Pricing />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent>
                            <WareHousingAndTransportationInfo />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent>
                            <Dimentions />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent>
                            <Attributes attributes={singleProduct?.attributes} />
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} lg={4} display={'flex'} flexDirection={'column'} rowGap={5}>
                        <Card>
                          <CardContent>
                            <Categories attributeGroupId={singleProduct?.category?.attribute_group_id} />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent>
                            <SeoInfo />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent>
                            <TaxInfo />
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent>
                            <DiscountInfo />
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </TabPanel>
                  <TabPanel value='2'>
                    <Typography>
                      Chocolate bar carrot cake candy canes sesame snaps. Cupcake pie gummi bears jujubes candy canes.
                      Chupa chups sesame snaps halvah.
                    </Typography>
                  </TabPanel>
                  <TabPanel value='3'>
                    <Typography>
                      Danish tiramisu jujubes cupcake chocolate bar cake cheesecake chupa chups. Macaroon ice cream
                      tootsie roll carrot cake gummi bears.
                    </Typography>
                  </TabPanel>
                </TabContext>
              </Grid>
              {/* <Grid item xs={12} lg={4} display={'flex'} flexDirection={'column'} rowGap={5}>
              <Card>
                <CardContent>
                  <Grid container spacing={5} className=''>
                    <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
                      <FormLabel>{keywordsTranslate.image}</FormLabel>
                      <Controller
                        name='image'
                        control={control}
                        render={({ field }) => (
                          <DropZone
                            files={
                              field.value
                                ? typeof field.value === 'string'
                                  ? [field.value]
                                  : [field.value as File]
                                : []
                            }
                            mimeType={
                              id ? (singleCategory?.image?.mime_type as ImageMimeType | VideoMimeType) : undefined
                            }
                            setFiles={(images: any) => field.onChange(images[0])}
                            type='image'
                            error={!!errors.image}
                          />
                        )}
                      />

                      {errors.image && <FormHelperText error>{errors.image?.message}</FormHelperText>}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

            </Grid> */}
            </Grid>
          </form>
        </Grid>
      </Grid>
    </FormProvider>
  )
}

export default ProductEditForm
