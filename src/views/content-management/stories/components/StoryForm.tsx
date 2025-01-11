'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography
} from '@mui/material'
import { type SubmitHandler, Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import LoadingButton from '@mui/lab/LoadingButton'
import { toast } from 'react-toastify'
import { isAfter, isBefore, isSameDay, isSameHour } from 'date-fns'

// Hook Imports
import { useFetch } from '@/utils/clientRequest'
import { translateReplacer } from '@/utils/translateReplacer'

// Component Imports
import type { getDictionary } from '@/utils/getDictionary'
import { useStatuses } from '@/@core/hooks/useStatuses'
import AutoComplete, { type IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import DropZone from '@/@core/components/dropzone/DropZone'
import { setFormErrors } from '@/utils/setFormErrors'
import { menuUrls } from '@/@menu/utils/menuUrls'
import CategoryAutoComplete from '@/@core/components/categoryAutocomplete'
import type { components } from '@/@core/api/v1'
import DatePicker from '@/@core/components/datePicker/DatePicker'
import BrandAutocomplete from '@/@core/components/brandAutocomplete'
import ProductFilterMaker from '@/@core/components/productFilterMaker/ProductFilterMaker'
import TextField from '@/@core/components/textField'
import type { ImageMimeType, VideoMimeType } from '@/@core/types'

const StoryForm = ({ dictionary, id }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; id?: number }) => {
  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary.keywords

  const inputTranslate = dictionary.input

  const uniqueValidationErrorsTranslate = dictionary?.unique_validation_errors

  const storyTranslate = dictionary.content_management.stories

  type FormData = z.infer<typeof schema>

  // Schema

  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    type: z.object(
      {
        label: z.string().optional(),
        value: z.string().optional() as z.ZodType<components['schemas']['StoryTypeEnum']['value']>
      },
      { required_error: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` }
    ),
    published: z.string({ required_error: `${keywordsTranslate.status} ${keywordsTranslate.isRequired}` }),
    published_at: z.union([z.string(), z.date()]).optional(),
    expired_at: z.union([z.string(), z.date()]).optional(),
    timer_start: z.union([z.string(), z.date()]).optional(),
    product_id: z
      .object({
        label: z.string().optional(),
        value: z.number().optional()
      })
      .optional(),
    category_id: z
      .object({
        label: z.string().optional(),
        value: z.number().optional()
      })
      .optional(),
    brand_id: z
      .object({
        label: z.string().optional(),
        value: z.number().optional()
      })
      .optional(),
    discount_id: z
      .object({
        label: z.string().optional(),
        value: z.number().optional()
      })
      .optional(),
    link: z.string().url({ message: uniqueValidationErrorsTranslate.urlValidation }).optional(),
    url: z.string().optional(),
    has_timer: z.string().optional(),
    media: z.union([
      z.string({ required_error: `${keywordsTranslate.content} ${keywordsTranslate.isRequired}` }),
      z.instanceof(File, { message: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` })
    ]),
    user_group_ids: z.union([
      z
        .array(
          z.object({
            label: z.string().optional(),
            value: z.number().optional()
          })
        )
        .optional(),
      z.null()
    ]),
    category_ids: z.union([
      z
        .array(
          z.object({
            label: z.string().optional(),
            value: z.number().optional()
          })
        )
        .optional(),
      z.null()
    ]),
    tags: z.union([
      z
        .array(
          z.object({
            label: z.string().optional(),
            value: z.union([z.string(), z.number()]).optional()
          })
        )
        .optional(),
      z.null()
    ]),
    order: z.string({ required_error: `${keywordsTranslate.ordering} ${keywordsTranslate.isRequired}` })
  })

  // Hooks

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
    watch,
    resetField,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: {
        label: keywordsTranslate.product,
        value: 'product'
      },
      published: '1',
      order: '1',
      published_at: new Date().toUTCString(),
      brand_id: {
        value: 0,
        label: ''
      },
      category_id: {
        value: 0,
        label: ''
      },
      product_id: {
        value: 0,
        label: ''
      },
      discount_id: {
        value: 0,
        label: ''
      },
      tags: []
    }
  })

  const typeWatch = watch('type')

  const publishWatch = watch('published')

  const publishedAtWatch = watch('published_at')

  const expiredAtWatch = watch('expired_at')

  const hasTimerWatch = watch('has_timer')

  const { queryParams: productQueryParams, setQueryParams: setProductQueryParams } = useQueryParams()

  const { queryParams: userGroupQueryParams, setQueryParams: setUserGroupQueryParams } = useQueryParams()

  const { queryParams: tagsQueryParams, setQueryParams: setTagsQueryParams } = useQueryParams()

  const { queryParams: discountQueryParams, setQueryParams: setDiscountQueryParams } = useQueryParams()

  const typeRef = useRef<IAutocompleteRef>(null)

  const productRef = useRef<IAutocompleteRef>(null)

  const userGroupRef = useRef<IAutocompleteRef>(null)

  const tagsRef = useRef<IAutocompleteRef>(null)

  const discountRef = useRef<IAutocompleteRef>(null)

  const statuses = useStatuses()

  const { data: storyData, isLoading: isLoadingStoryData } = useFetch().useQuery('get', '/story/data')

  const { data: productsData, isLoading: isLoadingProducts } = useFetch().useQuery(
    'get',
    '/select/{model}',
    {
      params: {
        path: {
          model: 'product'
        },
        query: {
          'filter[search]': productQueryParams.filter?.search
        }
      }
    },
    {
      enabled: typeWatch?.value === 'product'
    }
  )

  const { data: userGroupsData, isLoading: isLoadingUserGroupsData } = useFetch().useQuery('get', '/select/{model}', {
    params: {
      path: {
        model: 'user_group'
      },
      query: {
        'filter[search]': userGroupQueryParams.filter?.search
      }
    }
  })

  // const { data: discountsData, isLoading: isLoadingDiscountsData } = useFetch().useQuery(
  //   'get',
  //   '/select/{model}',
  //   {
  //     params: {
  //       path: {
  //         model: 'discount'
  //       },
  //       query: {
  //         'filter[search]': discountQueryParams.filter?.search
  //       }
  //     }
  //   },
  //   {
  //     enabled: typeWatch?.value === 'discount'
  //   }
  // )

  const { data: tagsData, isLoading: isLoadingTagsData } = useFetch().useQuery('get', '/select/{model}', {
    params: {
      path: {
        model: 'tag'
      },
      query: {
        'filter[search]': tagsQueryParams.filter?.search
      }
    }
  })

  const tagsOptions = tagsData?.data?.map(tag => ({ label: tag.label, value: tag.label }))

  const { data: singleStoryData, isLoading: isLoadingSingleStoryData } = useFetch().useQuery(
    'get',
    '/story/{story}',
    {
      params: {
        path: {
          story: id ?? 0
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleStory = singleStoryData?.data

  useEffect(() => {
    if (singleStory) {
      setValue('title', singleStory.title ?? '')

      setValue('type', {
        label: singleStory.type?.label ?? '',
        value: singleStory.type?.value ?? 'product'
      })

      setValue('order', singleStory.order?.toString() ?? '1')

      setValue('published', singleStory.published?.value ? '1' : '0')

      setValue('published_at', singleStory.published_at ?? '')

      setValue('expired_at', singleStory.expired_at ?? '')

      setValue('timer_start', singleStory.timer_start ?? '')

      if (singleStory.type?.value === 'product')
        setValue('product_id', { label: singleStory?.product?.title, value: singleStory?.product?.id })

      if (singleStory.type?.value === 'category')
        setValue('category_id', { label: singleStory?.category?.title, value: singleStory?.category?.id })

      if (singleStory.type?.value === 'brand')
        setValue('brand_id', { label: singleStory?.brand?.title, value: singleStory?.brand?.id })

      // if (singleStory.type?.value === 'discount')
      //   setValue('discount_id', { label: singleStory.discount.title, value: singleStory.discount.id })

      if (singleStory.type?.value === 'link') setValue('link', singleStory.link ?? '')

      if (singleStory.type?.value === 'filter') setValue('url', singleStory.url ?? '')

      setValue('has_timer', singleStory.has_timer ? '1' : '0')

      setValue('media', singleStory.media?.original_url ?? '')

      setValue(
        'user_group_ids',
        singleStory.user_groups?.map(group => ({ label: group.title, value: group.id }))
      )

      setValue(
        'category_ids',
        singleStory.categories?.map(category => ({ label: category.title, value: category.id }))
      )

      if (singleStory.tags?.length)
        setValue('tags', singleStory.tags?.map(tag => ({ label: tag.name, value: tag.name })) ?? [])
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleStory])

  const { mutateAsync: addStory, isPending: isAddingStory } = useFetch().useMutation('post', '/story')

  const { mutateAsync: editStory, isPending: isEditingStory } = useFetch().useMutation('put', '/story/{story}')

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const formData = new FormData()

    formData.append('title', data.title)

    formData.append('type', data.type.value.toString())

    formData.append('published', data.published)

    formData.append('order', data.order)

    if (!+data.published) formData.append('published_at', data.published_at ? data.published_at.toString() : '')

    formData.append('expired_at', data.expired_at ? data.expired_at.toString() : '')

    if (data.has_timer) formData.append('timer_start', data.timer_start ? data.timer_start.toString() : '')

    if (data.type.value === 'product') formData.append('product_id', data.product_id?.value?.toString() ?? '')

    if (data.type.value === 'category') formData.append('category_id', data.category_id?.value?.toString() ?? '')

    if (data.type.value === 'brand') formData.append('brand_id', data.brand_id?.value?.toString() ?? '')

    if (data.type.value === 'discount') formData.append('discount_id', data.discount_id?.value?.toString() ?? '')

    if (data.type.value === 'link') formData.append('link', data.link ?? '')

    if (data.type.value === 'filter') formData.append('url', data.url ?? '')

    formData.append('has_timer', data.has_timer === '1' ? '1' : '0')

    if (data.media && data.media instanceof File) {
      formData.append('media', data.media)
    }

    data.user_group_ids?.forEach(group => {
      if (group?.value !== undefined) {
        formData.append('user_group_ids[]', group.value.toString() ?? '0')
      }
    })

    data.category_ids?.forEach(category => {
      if (category?.value !== undefined) {
        formData.append('category_ids[]', category.value.toString() ?? '0')
      }
    })

    data.tags?.forEach(tag => {
      if (tag?.value !== undefined) {
        formData.append('tags[]', tag.value.toString() ?? '0')
      }
    })

    if (!id) {
      await addStory({
        body: formData as any
      })
        .then(res => {
          toast.success(res.message)
          router.push(menuUrls.content_management.story.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editStory({
        body: formData as any,
        params: {
          path: {
            story: id ?? 0
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          router.push(menuUrls.content_management.story.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isLoadingSingleStoryData) {
    return <LinearProgress />
  }

  return (
    <Grid container spacing={6}>
      <Grid xs={12} item>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <Grid spacing={6} container>
            <Grid item xs={12}>
              <div className='flex flex-wrap sm:items-center justify-between max-sm:flex-col gap-6'>
                <div>
                  <Typography variant='h4' className='mbe-1'>
                    {id ? storyTranslate.editStoryTitle : storyTranslate.addNewStoryTitle}
                  </Typography>
                </div>
                <div className='flex flex-wrap max-sm:flex-col gap-4'>
                  <LoadingButton variant='contained' type='submit' loading={isAddingStory || isEditingStory}>
                    {keywordsTranslate.save}
                  </LoadingButton>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12} md={6} lg={4}>
                      <Controller
                        name='title'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            autoFocus
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.title)}
                            label={keywordsTranslate.title}
                            {...(errors.title && { error: true, helperText: errors.title.message })}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                      <FormControl fullWidth>
                        <Controller
                          name='type'
                          control={control}
                          render={({ field }) => {
                            return (
                              <AutoComplete
                                {...field}
                                {...(errors.type && {
                                  error: true,
                                  helperText: errors.type.message
                                })}
                                open={false}
                                value={field.value}
                                onChange={(_, data) => {
                                  field.onChange(data)
                                  resetField('product_id')
                                  resetField('category_id')
                                  resetField('brand_id')
                                  resetField('discount_id')
                                  resetField('link')
                                  resetField('url')
                                }}
                                ref={typeRef}
                                options={storyData?.data?.types ?? []}
                                loading={isLoadingStoryData}
                                label={`${keywordsTranslate.type}`}
                              />
                            )
                          }}
                        />
                        {errors.type && <FormHelperText error>{errors.type.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} lg={4}>
                      <Controller
                        name='order'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='number'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.ordering)}
                            label={keywordsTranslate.ordering}
                            {...(errors.order && { error: true, helperText: errors.order.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <FormControl fullWidth error={!!errors.published}>
                        <InputLabel>{keywordsTranslate.status}</InputLabel>
                        <Controller
                          name='published'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                              label={keywordsTranslate.status}
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
                        {errors.published && <FormHelperText error>{errors.published?.message}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    {!+publishWatch && (
                      <Grid item xs={12} md={6} lg={4}>
                        <Controller
                          name='published_at'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <DatePicker
                              onChange={value => field.onChange(value?.toUTCString())}
                              value={field.value ? new Date(field.value) : null}
                              label={keywordsTranslate.publish_date}
                              shouldDisableDate={date => isAfter(date, expiredAtWatch ?? '')}
                              {...(errors.published_at && { error: true, helperText: errors.published_at.message })}
                              className='w-full'
                            />
                          )}
                        />
                        {errors.published_at && <FormHelperText error>{errors.published_at?.message}</FormHelperText>}
                      </Grid>
                    )}

                    <Grid item xs={12} md={6} lg={4}>
                      <Controller
                        name='expired_at'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <DatePicker
                            onChange={value => field.onChange(value?.toUTCString())}
                            value={field.value ? new Date(field.value) : null}
                            label={keywordsTranslate.expire_date}
                            shouldDisableDate={date =>
                              isBefore(date, publishedAtWatch ?? '') && !isSameDay(date, publishedAtWatch ?? '')
                            }
                            {...(errors.expired_at && { error: true, helperText: errors.expired_at.message })}
                            className='w-full'
                          />
                        )}
                      />
                      {errors.expired_at && <FormHelperText error>{errors.expired_at?.message}</FormHelperText>}
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                      <FormControl fullWidth error={!!errors.has_timer}>
                        <InputLabel>{keywordsTranslate.timer}</InputLabel>
                        <Controller
                          name='has_timer'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                              label={keywordsTranslate.timer}
                              {...field}
                              onChange={event => {
                                field.onChange(event)
                                setValue('timer_start', expiredAtWatch)
                              }}
                              value={field.value ?? '0'}
                            >
                              {statuses?.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.has_timer && <FormHelperText error>{errors.has_timer?.message}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    {+(hasTimerWatch ?? '') ? (
                      <Grid item xs={12} md={6} lg={4}>
                        <Controller
                          name='timer_start'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <DatePicker
                              onChange={value => field.onChange(value?.toUTCString())}
                              value={field.value ? new Date(field.value) : null}
                              label={keywordsTranslate.timer_start}
                              shouldDisableDate={date => isAfter(date, expiredAtWatch ?? '')}
                              {...(errors.timer_start && { error: true, helperText: errors.timer_start.message })}
                              className='w-full'
                            />
                          )}
                        />
                        {errors.timer_start && <FormHelperText error>{errors.timer_start?.message}</FormHelperText>}
                      </Grid>
                    ) : null}

                    {/* Product Autocomplete */}
                    {typeWatch?.value === 'product' && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Controller
                            name='product_id'
                            control={control}
                            render={({ field }) => {
                              return (
                                <AutoComplete
                                  {...field}
                                  {...(errors.product_id && {
                                    error: true,
                                    helperText: errors.product_id.message
                                  })}
                                  open={false}
                                  value={field.value}
                                  onChange={(_, data) => field.onChange(data)}
                                  ref={productRef}
                                  options={productsData?.data ?? []}
                                  loading={isLoadingProducts}
                                  label={`${keywordsTranslate.product}`}
                                  handleInputChange={value => {
                                    setProductQueryParams(prev => ({
                                      ...prev,
                                      filter: {
                                        ...prev.filter,
                                        search: value
                                      }
                                    }))
                                  }}
                                />
                              )
                            }}
                          />
                          {errors.product_id && <FormHelperText error>{errors.product_id.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                    )}

                    {typeWatch?.value === 'category' && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Controller
                            name='category_id'
                            control={control}
                            render={({ field }) => {
                              return (
                                <CategoryAutoComplete
                                  {...field}
                                  {...(errors.category_id && { error: true, helperText: errors.category_id.message })}
                                  label={`${keywordsTranslate.category}`}
                                  value={field.value}
                                  onChange={value => field.onChange(value)}
                                />
                              )
                            }}
                          />
                          {errors.category_id && <FormHelperText error>{errors.category_id?.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                    )}

                    {typeWatch?.value === 'brand' && (
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
                                  label={`${keywordsTranslate.brand}`}
                                  value={field.value}
                                  onChange={value => field.onChange(value)}
                                />
                              )
                            }}
                          />
                          {errors.brand_id && <FormHelperText error>{errors.brand_id?.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                    )}

                    {/* Discount Autocomplete */}
                    {/* {typeWatch?.value === 'discount' && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Controller
                            name='discount_id'
                            control={control}
                            render={({ field }) => {
                              return (
                                <AutoComplete
                                  {...field}
                                  {...(errors.type && {
                                    error: true,
                                    helperText: errors.type.message
                                  })}
                                  open={false}
                                  value={field.value}
                                  onChange={(_, data) => field.onChange(data)}
                                  ref={discountRef}
                                  options={discountsData?.data ?? []}
                                  loading={isLoadingDiscounts}
                                  label={`${keywordsTranslate.discount}`}
                                />
                              )
                            }}
                          />
                          {errors.discount_id && <FormHelperText error>{errors.discount_id.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
                    )} */}

                    {typeWatch?.value === 'link' && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Controller
                            name='link'
                            control={control}
                            render={({ field }) => {
                              return (
                                <TextField
                                  {...field}
                                  fullWidth
                                  type='url'
                                  placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.link)}
                                  label={keywordsTranslate.link}
                                  {...(errors.link && { error: true, helperText: errors.link.message })}
                                />
                              )
                            }}
                          />
                        </FormControl>
                      </Grid>
                    )}

                    {typeWatch?.value === 'filter' && (
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <ProductFilterMaker
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.filter)}
                            label={keywordsTranslate.filter}
                            setFilterUrl={url => {
                              setValue('url', url)
                              clearErrors('url')
                            }}
                            filterUrl={watch('url') ?? ''}
                            {...(errors.url && { error: true, helperText: errors.url.message })}
                          />
                        </FormControl>
                      </Grid>
                    )}

                    {/* user-groups Autocomplete */}

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='user_group_ids'
                          control={control}
                          render={({ field }) => {
                            return (
                              <AutoComplete
                                {...field}
                                {...(errors.type && {
                                  error: true,
                                  helperText: errors.type.message
                                })}
                                multiple
                                open={false}
                                value={field.value}
                                onChange={(_, data) => field.onChange(data)}
                                ref={userGroupRef}
                                options={userGroupsData?.data ?? []}
                                loading={isLoadingUserGroupsData}
                                handleInputChange={value =>
                                  setUserGroupQueryParams(prevParams => ({
                                    ...prevParams,
                                    filter: {
                                      ...prevParams.filter,
                                      search: value
                                    }
                                  }))
                                }
                                inputValue={userGroupQueryParams.filter?.search ?? ''}
                                label={`${keywordsTranslate.user_group}`}
                              />
                            )
                          }}
                        />
                        {errors.user_group_ids && (
                          <FormHelperText error>{errors.user_group_ids.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='category_ids'
                          control={control}
                          render={({ field }) => {
                            return (
                              <CategoryAutoComplete
                                {...field}
                                {...(errors.category_ids && { error: true, helperText: errors.category_ids.message })}
                                multiple
                                label={`${storyTranslate.highlight_category}`}
                                value={field.value ?? []}
                                onChange={value => field.onChange(value)}
                                type='highlight'
                              />
                            )
                          }}
                        />
                        {errors.category_ids && <FormHelperText error>{errors.category_ids?.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='tags'
                          control={control}
                          render={({ field }) => {
                            console.log(field)

                            return (
                              <AutoComplete
                                {...field}
                                {...(errors.tags && { error: true, helperText: errors.tags.message })}
                                multiple
                                open={false}
                                value={field.value}
                                onChange={(_, data) => field.onChange(data)}
                                ref={tagsRef}
                                options={tagsOptions ?? []}
                                loading={isLoadingTagsData}
                                handleInputChange={value =>
                                  setTagsQueryParams(prevParams => ({
                                    ...prevParams,
                                    filter: {
                                      ...prevParams.filter,
                                      search: value
                                    }
                                  }))
                                }
                                inputValue={tagsQueryParams.filter?.search ?? ''}
                                label={`${keywordsTranslate.tags}`}
                              />
                            )
                          }}
                        />
                        {errors.tags && <FormHelperText error>{errors.tags.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4} display={'flex'} flexDirection={'column'} rowGap={5}>
              <Card>
                <CardContent>
                  <Grid container spacing={5} className=''>
                    <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
                      <FormLabel>{keywordsTranslate.content}</FormLabel>
                      <Controller
                        name='media'
                        control={control}
                        render={({ field }) => (
                          <DropZone
                            type={'media'}
                            mimeType={id ? (singleStory?.media?.mime_type as ImageMimeType | VideoMimeType) : undefined}
                            files={
                              field.value
                                ? typeof field.value === 'string'
                                  ? [field.value]
                                  : [field.value as File]
                                : []
                            }
                            setFiles={(images: any) => field.onChange(images[0])}
                            error={!!errors.media}
                          />
                        )}
                      />

                      {errors.media && <FormHelperText error>{errors.media?.message}</FormHelperText>}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  )
}

export default StoryForm
