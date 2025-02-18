'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography
} from '@mui/material'

import { type SubmitHandler, Controller, type FieldError, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import LoadingButton from '@mui/lab/LoadingButton'
import { toast } from 'react-toastify'

// Hook Imports
import { useFetch } from '@/utils/clientRequest'
import { translateReplacer } from '@/utils/translateReplacer'

// Component Imports
import type { getDictionary } from '@/utils/getDictionary'
import AutoComplete, { type IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import { setFormErrors } from '@/utils/setFormErrors'
import { menuUrls } from '@/@menu/utils/menuUrls'
import type { components } from '@/@core/api/v1'
import TextField from '@/@core/components/textField'
import { commaSeparator } from '@/utils/commaSeparator'
import { handleRawValueChange } from '@/utils/handleRawValueChange'
import CategoryAutoComplete from '@/@core/components/categoryAutocomplete'
import BrandAutocomplete from '@/@core/components/brandAutocomplete'
import TagAutocomplete from '@/@core/components/tagAutocomplete'

const UserGroupForm = ({ dictionary, id }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; id?: number }) => {
  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary.keywords

  const inputTranslate = dictionary.input

  const userGroupTranslate = dictionary.user_management.user_group

  type FormData = z.infer<typeof schema>

  // Schema

  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    description: z.string().optional(),
    min_price: z.number({ required_error: `${keywordsTranslate.min_price} ${keywordsTranslate.isRequired}` }),
    order_count: z.number({ required_error: `${keywordsTranslate.order_count} ${keywordsTranslate.isRequired}` }),
    pricing_plan_id: z.object(
      {
        label: z.string().optional(),
        value: z.number().optional()
      },
      { required_error: `${keywordsTranslate.pricing_plan} ${keywordsTranslate.isRequired}` }
    ),
    type: z.object(
      {
        label: z.string().optional(),
        value: z.string().optional() as z.ZodType<components['schemas']['UserGroupEnum']['value']>
      },
      { required_error: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` }
    ),
    exceptions: z.array(
      z.object({
        type: z.string({
          required_error: `${userGroupTranslate.exception_type} ${keywordsTranslate.isRequired}`
        }) as z.ZodType<components['schemas']['UserGroupExceptionTypeEnum']['value']>,
        value: z.object(
          {
            label: z.string().optional(),
            value: z.number().optional()
          },
          { required_error: `${keywordsTranslate.value} ${keywordsTranslate.isRequired}` }
        ),

        application_percent: z.number({
          required_error: `${userGroupTranslate.application_percent} ${keywordsTranslate.isRequired}`
        }),
        website_percent: z.number({
          required_error: `${userGroupTranslate.website_percent} ${keywordsTranslate.isRequired}`
        })
      })
    ),

    profit_ids: z.array(
      z.object({
        label: z.string().optional(),
        value: z.number().optional()
      }),
      { required_error: `${keywordsTranslate.profits} ${keywordsTranslate.isRequired}` }
    )
  })

  // Hooks

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      exceptions: []
    }
  })

  const exceptionsWatch = watch('exceptions')

  const { queryParams: pricingPlanQueryParams, setQueryParams: setPricingPlanQueryParams } = useQueryParams()

  const { queryParams: profitQueryParams, setQueryParams: setProfitQueryParams } = useQueryParams()

  const pricingPlanRef = useRef<IAutocompleteRef>(null)

  const typeRef = useRef<IAutocompleteRef>(null)

  const profitRef = useRef<IAutocompleteRef>(null)

  const { data: userGroupData, isLoading: isLoadingUserGroupData } = useFetch().useQuery('get', '/user-group/data')

  const userGroupsTypes = userGroupData?.data?.type

  const exceptionsTypes = userGroupData?.data?.exceptions_type

  const { data: pricingPlansData, isLoading: isLoadingPricingPlans } = useFetch().useQuery('get', '/select/{model}', {
    params: {
      path: {
        model: 'pricing_plan'
      },
      query: {
        'filter[search]': pricingPlanqueryParams?.filter?.search
      }
    }
  })

  const { data: profitsData, isLoading: isLoadingProfits } = useFetch().useQuery('get', '/select/{model}', {
    params: {
      path: {
        model: 'profit'
      },
      query: {
        'filter[search]': profitqueryParams?.filter?.search
      }
    }
  })

  const { data: singleUserGroupData, isLoading: isLoadingSingleUserGroupData } = useFetch().useQuery(
    'get',
    '/user-group/{userGroup}',
    {
      params: {
        path: {
          userGroup: id ?? 0
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleUserGroup = singleUserGroupData?.data

  useEffect(() => {
    if (singleUserGroup) {
      setValue('title', singleUserGroup.title ?? '')
      setValue('description', singleUserGroup.description ?? '')
      setValue('min_price', singleUserGroup.min_price?.value ?? 0)
      setValue('order_count', singleUserGroup.order_count ?? 0)
      setValue('pricing_plan_id', {
        label: singleUserGroup.pricing_plan?.title,
        value: singleUserGroup.pricing_plan?.id
      })
      setValue('type', {
        label: singleUserGroup.type?.label,
        value: singleUserGroup.type?.value as components['schemas']['UserGroupEnum']['value']
      })

      setValue(
        'exceptions',
        singleUserGroup.exceptions?.map(exception => ({
          type: exception.type,
          value: { label: exception.morph?.title ?? exception?.morph?.name, value: exception.morph?.id ?? 0 },
          application_percent: exception.application_percent,
          website_percent: exception.website_percent
        })) ?? []
      )

      setValue('profit_ids', singleUserGroup.profits?.map(profit => ({ label: profit.title, value: profit.id })) ?? [])
    } else {
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleUserGroup])

  const { mutateAsync: addUserGroup, isPending: isAddingUserGroup } = useFetch().useMutation('post', '/user-group')

  const { mutateAsync: editUserGroup, isPending: isEditingUserGroup } = useFetch().useMutation(
    'put',
    '/user-group/{userGroup}'
  )

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!id) {
      await addUserGroup({
        body: {
          title: data.title,
          description: data.description ?? '',
          min_price: data.min_price,
          order_count: data.order_count,
          pricing_plan_id: data.pricing_plan_id.value ?? 0,
          type: data.type.value,
          exceptions:
            data?.exceptions?.map(exception => ({
              application_percent: exception.application_percent,
              website_percent: exception.website_percent,
              type: exception?.type,
              value: exception?.value?.value ?? 0
            })) ?? [],
          profit_ids: data.profit_ids.map(profit => profit.value ?? 0)
        }
      })
        .then(res => {
          toast.success(res.message)
          router.push(menuUrls.user_management.user_groups.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editUserGroup({
        body: {
          title: data.title,
          description: data.description ?? '',
          min_price: data.min_price,
          order_count: data.order_count,
          pricing_plan_id: data.pricing_plan_id.value ?? 0,
          type: data.type.value,
          exceptions:
            data?.exceptions?.map(exception => ({
              application_percent: exception.application_percent,
              website_percent: exception.website_percent,
              type: exception?.type,
              value: exception?.value?.value ?? 0
            })) ?? [],
          profit_ids: data.profit_ids.map(profit => profit.value ?? 0)
        },
        params: {
          path: {
            userGroup: id ?? 0
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          router.push(menuUrls.user_management.user_groups.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  const handleAddException = () => {
    if (exceptionsWatch?.length) {
      setValue('exceptions', [
        ...exceptionsWatch,
        {
          type: 'category',
          value: undefined as any,
          application_percent: 0,
          website_percent: 0
        }
      ])
    } else {
      setValue('exceptions', [
        {
          type: 'category',
          value: undefined as any,
          application_percent: 0,
          website_percent: 0
        }
      ])
    }
  }

  const handleRemoveException = (itemIndex: number) => {
    if (exceptionsWatch?.length) {
      setValue(
        'exceptions',
        exceptionsWatch?.filter((_, index) => index !== itemIndex)
      )
    }
  }

  if (id && isLoadingSingleUserGroupData) {
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
                    {id ? userGroupTranslate.edit_user_group : userGroupTranslate.add_user_group}
                  </Typography>
                </div>
                <div className='flex flex-wrap max-sm:flex-col gap-4'>
                  <LoadingButton variant='contained' type='submit' loading={isAddingUserGroup || isEditingUserGroup}>
                    {keywordsTranslate.save}
                  </LoadingButton>
                </div>
              </div>
            </Grid>
            <Grid item xs={12}>
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
                                value={field.value ?? null}
                                onChange={(_, data) => field.onChange(data)}
                                ref={typeRef}
                                options={userGroupsTypes ?? []}
                                loading={isLoadingUserGroupData}
                                label={`${keywordsTranslate.type}`}
                              />
                            )
                          }}
                        />
                        {errors.type && <FormHelperText error>{errors.type.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Controller
                        name='min_price'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => {
                          return (
                            <TextField
                              {...field}
                              fullWidth
                              autoFocus
                              type='text'
                              value={field.value ? commaSeparator(field.value) : ''}
                              onChange={event => handleRawValueChange(event, field.onChange)}
                              placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.min_price)}
                              label={keywordsTranslate.min_price}
                              {...(errors.min_price && { error: true, helperText: errors.min_price.message })}
                            />
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Controller
                        name='order_count'
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
                              placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.order_count)}
                              label={keywordsTranslate.order_count}
                              {...(errors.order_count && { error: true, helperText: errors.order_count.message })}
                            />
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <FormControl fullWidth>
                        <Controller
                          name='pricing_plan_id'
                          control={control}
                          render={({ field }) => {
                            return (
                              <AutoComplete
                                {...field}
                                {...(errors.pricing_plan_id && {
                                  error: true,
                                  helperText: errors.pricing_plan_id.message
                                })}
                                open={false}
                                value={field.value ?? null}
                                onChange={(_, data) => field.onChange(data)}
                                ref={pricingPlanRef}
                                options={pricingPlansData?.data ?? []}
                                loading={isLoadingPricingPlans}
                                handleInputChange={value =>
                                  setPricingPlanQueryParams(prevParams => ({
                                    ...prevParams,
                                    filter: {
                                      ...prevParams.filter,
                                      search: value
                                    }
                                  }))
                                }
                                inputValue={pricingPlanqueryParams?.filter?.search ?? ''}
                                label={`${keywordsTranslate.pricing_plan}`}
                              />
                            )
                          }}
                        />
                        {errors.pricing_plan_id && (
                          <FormHelperText error>{errors.pricing_plan_id.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <FormControl fullWidth>
                        <Controller
                          name='profit_ids'
                          control={control}
                          render={({ field }) => {
                            return (
                              <AutoComplete
                                {...field}
                                {...(errors.profit_ids && {
                                  error: true,
                                  helperText: errors.profit_ids.message
                                })}
                                multiple
                                open={false}
                                value={field.value ?? []}
                                onChange={(_, data) => field.onChange(data)}
                                ref={profitRef}
                                options={profitsData?.data ?? []}
                                loading={isLoadingProfits}
                                handleInputChange={value =>
                                  setProfitQueryParams(prevParams => ({
                                    ...prevParams,
                                    filter: {
                                      ...prevParams.filter,
                                      search: value
                                    }
                                  }))
                                }
                                inputValue={profitqueryParams?.filter?.search ?? ''}
                                label={`${keywordsTranslate.profits}`}
                              />
                            )
                          }}
                        />
                        {errors.pricing_plan_id && (
                          <FormHelperText error>{errors.pricing_plan_id.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='description'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            autoFocus
                            type='text'
                            multiline
                            rows={3}
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.description)}
                            label={keywordsTranslate.description}
                            {...(errors.description && { error: true, helperText: errors.description.message })}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12}>
                      <Typography>{keywordsTranslate.exceptions}</Typography>
                    </Grid>
                    {exceptionsWatch?.map((exception, index) => (
                      <>
                        <Grid item xs={12} md={6} lg={3}>
                          <FormControl fullWidth error={!!errors.exceptions?.[index]?.type}>
                            <InputLabel>{userGroupTranslate.exception_type}</InputLabel>
                            <Controller
                              name={`exceptions.${index}.type`}
                              control={control}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <Select label={userGroupTranslate.exception_type} {...field}>
                                  {exceptionsTypes?.map(type => (
                                    <MenuItem key={type.value} value={type.value}>
                                      {type.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              )}
                            />
                            {errors.exceptions?.[index]?.type && (
                              <FormHelperText error>
                                {(errors?.exceptions?.[index].type as FieldError)?.message}
                              </FormHelperText>
                            )}
                          </FormControl>
                        </Grid>
                        {exception.type === 'category' && (
                          <Grid item xs={12} md={6} lg={3}>
                            <FormControl fullWidth>
                              <Controller
                                name={`exceptions.${index}.value`}
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <CategoryAutoComplete
                                      type='product'
                                      {...field}
                                      {...(errors.exceptions?.[index]?.value && {
                                        error: true,
                                        helperText: errors.exceptions?.[index]?.value.message
                                      })}
                                      label={`${keywordsTranslate.category}`}
                                      value={field.value}
                                      onChange={value => field.onChange(value)}
                                      addOption={false}
                                    />
                                  )
                                }}
                              />
                              {errors.exceptions?.[index]?.value && (
                                <FormHelperText error>{errors.exceptions?.[index]?.value.message}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                        )}
                        {exception.type === 'brand' && (
                          <Grid item xs={12} md={6} lg={3}>
                            <FormControl fullWidth>
                              <Controller
                                name={`exceptions.${index}.value`}
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <BrandAutocomplete
                                      {...field}
                                      {...(errors.exceptions?.[index]?.value && {
                                        error: true,
                                        helperText: errors.exceptions?.[index]?.value.message
                                      })}
                                      label={`${keywordsTranslate.brand}`}
                                      value={field.value}
                                      onChange={value => field.onChange(value)}
                                      addOption={false}
                                    />
                                  )
                                }}
                              />
                              {errors.exceptions?.[index]?.value && (
                                <FormHelperText error>{errors.exceptions?.[index]?.value.message}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                        )}
                        {exception.type === 'tag' && (
                          <Grid item xs={12} md={6} lg={3}>
                            <FormControl fullWidth>
                              <Controller
                                name={`exceptions.${index}.value`}
                                control={control}
                                render={({ field }) => {
                                  return (
                                    <TagAutocomplete
                                      {...field}
                                      {...(errors.exceptions?.[index]?.value && {
                                        error: true,
                                        helperText: errors.exceptions?.[index]?.value.message
                                      })}
                                      label={`${keywordsTranslate.tag}`}
                                      value={field.value}
                                      onChange={value => field.onChange(value)}
                                      addOption={false}
                                    />
                                  )
                                }}
                              />
                              {errors.exceptions?.[index]?.value && (
                                <FormHelperText error>{errors.exceptions?.[index]?.value.message}</FormHelperText>
                              )}
                            </FormControl>
                          </Grid>
                        )}
                        <Grid item xs={12} md={6} lg={3}>
                          <Controller
                            name={`exceptions.${index}.application_percent`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => {
                              return (
                                <TextField
                                  {...field}
                                  fullWidth
                                  type='number'
                                  value={field.value}
                                  onChange={event => field.onChange(+event.target.value)}
                                  placeholder={translateReplacer(
                                    inputTranslate.placeholder,
                                    userGroupTranslate.application_percent
                                  )}
                                  label={userGroupTranslate.application_percent}
                                  {...(errors.exceptions?.[index]?.application_percent && {
                                    error: true,
                                    helperText: errors.exceptions?.[index]?.application_percent.message
                                  })}
                                />
                              )
                            }}
                          />
                        </Grid>
                        <Grid item xs={8} md={5} lg={2}>
                          <Controller
                            name={`exceptions.${index}.website_percent`}
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => {
                              return (
                                <TextField
                                  {...field}
                                  fullWidth
                                  type='number'
                                  value={field.value}
                                  onChange={event => field.onChange(+event.target.value)}
                                  placeholder={translateReplacer(
                                    inputTranslate.placeholder,
                                    userGroupTranslate.website_percent
                                  )}
                                  label={userGroupTranslate.website_percent}
                                  {...(errors.exceptions?.[index]?.website_percent && {
                                    error: true,
                                    helperText: errors.exceptions?.[index]?.website_percent.message
                                  })}
                                />
                              )
                            }}
                          />
                        </Grid>
                        <Grid item xs={4} sm={1}>
                          <Button
                            variant='contained'
                            color='error'
                            className='!w-full !h-[56px]'
                            onClick={() => handleRemoveException(index)}
                          >
                            <i className='ri-delete-bin-7-line' />
                          </Button>
                        </Grid>
                      </>
                    ))}

                    <Grid item xs={12}>
                      <Button variant='outlined' fullWidth onClick={handleAddException}>
                        {userGroupTranslate.add_exception}
                      </Button>
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

export default UserGroupForm
