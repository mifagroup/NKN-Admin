'use client'

// React Imports
import { forwardRef, useEffect } from 'react'

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
import TextField from '@/@core/components/textField'

interface TaxFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  selectedItem?: { id: number | undefined; status: 'editing' | 'deleting' | 'adding' | 'toggling' }
  listQueryParams: Partial<components['parameters']>
}

const TaxForm = forwardRef<DrawerHandle, TaxFormProps>(({ dictionary, selectedItem, listQueryParams }, ref) => {
  // Vars
  const keywordsTranslate = dictionary?.keywords

  const uniqueValidationErrorsTranslate = dictionary?.unique_validation_errors

  const inputTranslate = dictionary?.input

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    rate: z
      .number({ required_error: `${keywordsTranslate.percent} ${keywordsTranslate.isRequired}` })
      .min(0, {
        message: `${keywordsTranslate.percent} ${uniqueValidationErrorsTranslate.cannotBeLessThan.replace('$', '0')}`
      })
      .max(100, {
        message: `${keywordsTranslate.percent} ${uniqueValidationErrorsTranslate.cannotBeMoreThan.replace('$', '100')}`
      }),
    published: z.string()
  })

  // Hooks
  const queryClient = useQueryClient()

  const statuses = useStatuses()

  const {
    data: singleTaxData,
    isLoading: isLoadingTax,
    isFetching
  } = useFetch().useQuery(
    'get',
    '/tax/{tax}',
    {
      params: {
        path: {
          tax: selectedItem?.id ?? 0
        }
      }
    },
    {
      enabled: !!selectedItem?.id
    }
  )

  const singleTax = singleTaxData?.data

  useEffect(() => {
    if (!isFetching && selectedItem?.status === 'editing') {
      handleOpenDrawer()
      setValue('title', singleTax?.title ?? '')
      setValue('rate', singleTax?.rate ?? 0)
      setValue('published', singleTax?.published?.value ? '1' : '0')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, selectedItem?.status, selectedItem?.id])

  useEffect(() => {
    if (selectedItem?.status === 'adding') reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.status])

  const { mutateAsync: addTax, isPending: isAddingTax } = useFetch().useMutation('post', '/tax')

  const { mutateAsync: editTax, isPending: isEditingTax } = useFetch().useMutation('put', '/tax/{tax}')

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
      rate: undefined,
      published: '1'
    }
  })

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!selectedItem?.id) {
      await addTax({
        body: {
          title: data.title,
          rate: data.rate,
          published: data.published === '1' ? 1 : 0
        }
      })
        .then(res => {
          toast.success(res.message)
          handleCloseDrawer()
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/tax',
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
      await editTax({
        body: {
          title: data.title,
          rate: data.rate,
          published: data.published === '1' ? 1 : 0
        },
        params: {
          path: {
            tax: selectedItem?.id
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          handleCloseDrawer()
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/tax',
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
    <FormDrawer title={`${keywordsTranslate.add} ${keywordsTranslate.taxGroup}`} ref={ref}>
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
            name='rate'
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  type='number'
                  value={!!field.value ? field.value : undefined}
                  onChange={event => field.onChange(+event.target.value)}
                  placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.percent)}
                  label={keywordsTranslate.percent}
                  {...(errors.rate && { error: true, helperText: errors.rate.message })}
                />
              )
            }}
          />
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
        </div>
        <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'} paddingX={5}>
          <LoadingButton variant='outlined' color='error' onClick={handleCloseDrawer}>
            {keywordsTranslate?.cancel}
          </LoadingButton>
          <LoadingButton variant='contained' type='submit' loading={isAddingTax || isEditingTax}>
            {keywordsTranslate?.save}
          </LoadingButton>
        </Box>
      </form>
    </FormDrawer>
  )
})

export default TaxForm
