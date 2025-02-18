'use client'

// React Imports
import { forwardRef, useEffect, useRef } from 'react'

// Third-party Imports
import { Box, FormControl, FormHelperText, InputLabel, LinearProgress, MenuItem, Select } from '@mui/material'
import { type SubmitHandler, Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import LoadingButton from '@mui/lab/LoadingButton'
import { toast } from 'react-toastify'

// Hook Imports
import { useQueryClient } from '@tanstack/react-query'

import { useFetch } from '@/utils/clientRequest'
import { translateReplacer } from '@/utils/translateReplacer'

// Component Imports
import { type components } from '@/@core/api/v1'
import type { getDictionary } from '@/utils/getDictionary'
import FormDrawer, { type DrawerHandle } from '@/@core/components/drawers/FormDrawer'
import { useStatuses } from '@/@core/hooks/useStatuses'
import { setFormErrors } from '@/utils/setFormErrors'
import type { IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'
import AutoComplete from '@/@core/components/autoComplete/AutoComplete'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import { commaSeparator } from '@/utils/commaSeparator'
import { handleRawValueChange } from '@/utils/handleRawValueChange'
import TextField from '@/@core/components/textField'

interface ProfitFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  selectedItem?: { id: number | undefined; status: 'editing' | 'deleting' | 'adding' | 'toggling' }
  listQueryParams: Partial<components['parameters']>
}

const ProfitForm = forwardRef<DrawerHandle, ProfitFormProps>(({ dictionary, selectedItem, listQueryParams }, ref) => {
  // Vars
  const keywordsTranslate = dictionary?.keywords

  const inputTranslate = dictionary?.input

  const uniqueValidationErrorsTranslate = dictionary?.unique_validation_errors

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    description: z.string().optional(),
    published: z.string(),
    month: z.number({ required_error: `${keywordsTranslate.month} ${keywordsTranslate.isRequired}` }),
    value: z
      .number({ required_error: `${keywordsTranslate.value} ${keywordsTranslate.isRequired}` })
      .max(100, { message: translateReplacer(uniqueValidationErrorsTranslate.max_value, '100') }),
    min_price: z.number({ required_error: `${keywordsTranslate.min_price} ${keywordsTranslate.isRequired}` }),
    user_group_ids: z.array(
      z.object({
        label: z.string().optional(),
        value: z.number().optional()
      }),
      { required_error: `${keywordsTranslate.user_groups} ${keywordsTranslate.isRequired}` }
    )
  })

  // Hooks

  const { queryParams: userGroupQueryParams, setQueryParams: setUserGroupQueryParams } = useQueryParams()

  const queryClient = useQueryClient()

  const statuses = useStatuses()

  const { data: userGroupsData, isLoading: isLoadingUserGroupsData } = useFetch().useQuery('get', '/select/{model}', {
    params: {
      path: {
        model: 'user_group'
      },
      query: {
        'filter[search]': userGroupqueryParams?.filter?.search
      }
    }
  })

  const {
    data: singleProfitData,

    isFetching
  } = useFetch().useQuery(
    'get',
    '/profit/{profit}',
    {
      params: {
        path: {
          profit: selectedItem?.id ?? 0
        }
      }
    },
    {
      enabled: !!selectedItem?.id
    }
  )

  const singleProfit = singleProfitData?.data

  useEffect(() => {
    if (!isFetching && selectedItem?.status === 'editing') {
      handleOpenDrawer()
      setValue('title', singleProfit?.title ?? '')
      setValue('description', singleProfit?.description ?? '')
      setValue('published', singleProfit?.published?.value ? '1' : '0')
      setValue('month', singleProfit?.month ?? 0)
      setValue('value', singleProfit?.value ?? 0)
      setValue('min_price', singleProfit?.min_price?.value ?? 0)
      setValue(
        'user_group_ids',
        singleProfit?.user_groups?.map(group => ({ label: group.title, value: group.id })) ?? []
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, selectedItem?.status, selectedItem?.id])

  useEffect(() => {
    if (selectedItem?.status === 'adding') reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.status])

  const { mutateAsync: addProfit, isPending: isAddingProfit } = useFetch().useMutation('post', '/profit')

  const { mutateAsync: editProfit, isPending: isEditingProfit } = useFetch().useMutation('put', '/profit/{profit}')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      published: '1'
    }
  })

  const userGroupRef = useRef<IAutocompleteRef>(null)

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!selectedItem?.id) {
      await addProfit({
        body: {
          title: data.title,
          description: data.description ?? '',
          published: data.published === '1' ? 1 : 0,
          month: data.month,
          value: data.value,
          min_price: data.min_price,
          user_group_ids: data.user_group_ids?.map(group => group.value ?? 0)
        }
      })
        .then(res => {
          toast.success(res.message)
          handleCloseDrawer()
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/profit',
              {
                params: {
                  query: listQueryParams
                }
              }
            ]
          })

          if (!selectedItem?.id) {
            reset()
          }
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editProfit({
        body: {
          title: data.title,
          description: data.description ?? '',
          published: data.published === '1' ? 1 : 0,
          month: data.month,
          value: data.value,
          min_price: data.min_price,
          user_group_ids: data.user_group_ids?.map(group => group.value ?? 0)
        },
        params: {
          path: {
            profit: selectedItem?.id
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          handleCloseDrawer()
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/profit',
              {
                params: {
                  query: listQueryParams
                }
              }
            ]
          })

          if (!selectedItem?.id) {
            reset()
          }
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  const handleCloseDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.close()

  const handleOpenDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.open()

  if (selectedItem?.id && isFetching) {
    return <LinearProgress />
  }

  return (
    <FormDrawer
      title={`${selectedItem?.id ? keywordsTranslate.edit : keywordsTranslate.add} ${keywordsTranslate.profit}`}
      ref={ref}
    >
      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-y-6 p-5'>
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
                  placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.title)}
                  label={keywordsTranslate.title}
                  {...(errors.title && { error: true, helperText: errors.title.message })}
                />
              )
            }}
          />

          <Controller
            name='month'
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
                  placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.month)}
                  label={keywordsTranslate.month}
                  {...(errors.month && { error: true, helperText: errors.month.message })}
                />
              )
            }}
          />
          <Controller
            name='value'
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
                  placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.value)}
                  label={keywordsTranslate.value}
                  {...(errors.value && { error: true, helperText: errors.value.message })}
                />
              )
            }}
          />
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
          <FormControl fullWidth>
            <Controller
              name='user_group_ids'
              control={control}
              render={({ field }) => {
                return (
                  <AutoComplete
                    {...field}
                    {...(errors.user_group_ids && {
                      error: true,
                      helperText: errors.user_group_ids.message
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
                    label={`${keywordsTranslate.user_groups}`}
                  />
                )
              }}
            />
            {errors.user_group_ids && <FormHelperText error>{errors.user_group_ids.message}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth error={!!errors.published}>
            <InputLabel>{keywordsTranslate.status}</InputLabel>
            <Controller
              name='published'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select label={keywordsTranslate.status} {...field}>
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
          <Controller
            name='description'
            rules={{ required: true }}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                multiline
                rows={4}
                fullWidth
                placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.description)}
                label={keywordsTranslate.description}
                {...(errors.description && { error: true, helperText: errors.description.message })}
              />
            )}
          />
        </div>
        <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'} paddingX={5}>
          <LoadingButton variant='outlined' color='error' onClick={handleCloseDrawer}>
            {keywordsTranslate?.cancel}
          </LoadingButton>
          <LoadingButton variant='contained' type='submit' loading={isAddingProfit || isEditingProfit}>
            {keywordsTranslate?.save}
          </LoadingButton>
        </Box>
      </form>
    </FormDrawer>
  )
})

export default ProfitForm
