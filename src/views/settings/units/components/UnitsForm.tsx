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

interface UnitFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  selectedItem?: { id: number | undefined; status: 'editing' | 'deleting' | 'adding' | 'toggling' }
  listQueryParams: Partial<components['parameters']>
}

const UnitsForm = forwardRef<DrawerHandle, UnitFormProps>(({ dictionary, selectedItem, listQueryParams }, ref) => {
  // Vars
  const keywordsTranslate = dictionary?.keywords

  const inputTranslate = dictionary?.input

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    type: z.string({
      required_error: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}`
    }),
    value: z.number({ required_error: `${keywordsTranslate.value} ${keywordsTranslate.isRequired}` }),
    published: z.string()
  })

  // Hooks
  const queryClient = useQueryClient()

  const statuses = useStatuses()

  const { data: unitData, isLoading: isLoadingUnitData } = useFetch().useQuery('get', '/unit/data')

  const unitTypes = unitData?.data?.types

  const {
    data: singleUnitData,
    isLoading: isLoadingUnit,
    isFetching
  } = useFetch().useQuery(
    'get',
    '/unit/{unit}',
    {
      params: {
        path: {
          unit: selectedItem?.id ?? 0
        }
      }
    },
    {
      enabled: !!selectedItem?.id
    }
  )

  const singleUnit = singleUnitData?.data

  useEffect(() => {
    if (!isFetching && selectedItem?.status === 'editing') {
      handleOpenDrawer()
      setValue('title', singleUnit?.title ?? '')
      setValue('value', singleUnit?.value ?? 0)
      setValue('type', singleUnit?.type?.value ?? '')
      setValue('published', singleUnit?.published?.value ? '1' : '0')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, selectedItem?.status, selectedItem?.id])

  useEffect(() => {
    if (selectedItem?.status === 'adding') reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.status])

  const { mutateAsync: addUnit, isPending: isAddingUnit } = useFetch().useMutation('post', '/unit')

  const { mutateAsync: editUnit, isPending: isEditingUnit } = useFetch().useMutation('put', '/unit/{unit}')

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
      value: undefined,
      published: '1'
    }
  })

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!selectedItem?.id) {
      await addUnit({
        body: {
          title: data.title,
          value: data.value,
          type: data.type as NonNullable<components['schemas']['UnitDetailResource']['type']>['value'],
          published: data.published === '1' ? 1 : 0
        }
      })
        .then(res => {
          toast.success(res.message)
          handleCloseDrawer()
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/unit',
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
      await editUnit({
        body: {
          title: data.title,
          value: data.value,
          type: data.type as NonNullable<components['schemas']['UnitDetailResource']['type']>['value'],
          published: data.published === '1' ? 1 : 0
        },
        params: {
          path: {
            unit: selectedItem?.id
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          handleCloseDrawer()
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/unit',
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
    <FormDrawer title={`${keywordsTranslate.add} ${keywordsTranslate.unit}`} ref={ref}>
      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-y-6 p-5'>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>{keywordsTranslate.type}</InputLabel>
            <Controller
              name='type'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select label={keywordsTranslate.type} {...field}>
                  {unitTypes?.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.type && <FormHelperText error>{errors.type?.message}</FormHelperText>}
          </FormControl>
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
                  placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.name)}
                  label={keywordsTranslate.name}
                  {...(errors.title && { error: true, helperText: errors.title.message })}
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
                  autoFocus
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
          <LoadingButton variant='contained' type='submit' loading={isAddingUnit || isEditingUnit}>
            {keywordsTranslate?.save}
          </LoadingButton>
        </Box>
      </form>
    </FormDrawer>
  )
})

export default UnitsForm
