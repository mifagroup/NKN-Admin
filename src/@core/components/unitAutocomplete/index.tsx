import React, { useRef, useState } from 'react'

import {
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Autocomplete as MuiAutocomplete,
  Select
} from '@mui/material'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import LoadingButton from '@mui/lab/LoadingButton'

import { useQueryClient } from '@tanstack/react-query'

import { useGetDictionary } from '@/utils/useGetDictionary'
import DebouncedInput from '../custom-inputs/DebouncedInput'
import { useFetch } from '@/utils/clientRequest'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import CustomIconButton from '../mui/IconButton'
import FormDrawer, { type DrawerHandle } from '../drawers/FormDrawer'
import { setFormErrors } from '@/utils/setFormErrors'
import { translateReplacer } from '@/utils/translateReplacer'
import { useStatuses } from '@/@core/hooks/useStatuses'
import DropZone from '../dropzone/DropZone'
import type { components, operations } from '@/@core/api/v1'
import TextField from '../textField'
import { type OptionType } from '@/@core/types'

type IAutocompleteProps = {
  error?: boolean
  label: string
  multiple?: boolean
  value?: { value?: string | number | undefined; label?: string | undefined } | null | undefined
  onChange?: (data: any) => void
  addOption?: boolean
  type?: NonNullable<operations['selectByModel']['parameters']['query']>['type']
}

const UnitAutocomplete = ({
  error = false,
  multiple = false,
  label,
  value,
  onChange,
  addOption = true,
  type
}: IAutocompleteProps) => {
  // States

  const [open, setOpen] = useState(false)

  // Hooks

  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const unitTranslate = dictionary?.settings.unit

  const inputTranslate = dictionary?.input

  type FormData = z.infer<typeof schema>

  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate?.title} ${keywordsTranslate?.isRequired}` }),
    type: z.string({
      required_error: `${keywordsTranslate?.type} ${keywordsTranslate?.isRequired}`
    }),
    value: z.number({ required_error: `${keywordsTranslate?.value} ${keywordsTranslate?.isRequired}` }),
    published: z.string()
  })

  const formDrawerRef = useRef<DrawerHandle>(null)

  const statuses = useStatuses()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: undefined,
      published: '1'
    }
  })

  const { data: unitsData, isLoading: isLoadingUnitsData } = useFetch().useQuery('get', '/unit/data')

  const unitTypes = unitsData?.data?.types

  const { queryParams, setQueryParams } = useQueryParams<operations['selectByModel']['parameters']['query']>()

  const { data: unitsListData, isLoading: isLoadingUnitsList } = useFetch().useQuery('get', '/select/{model}', {
    params: {
      path: {
        model: 'unit'
      },
      query: {
        type,
        ...queryParams
      }
    }
  })

  const { mutateAsync: addUnit, isPending: isAddingUnit } = useFetch().useMutation('post', '/unit')

  const queryClient = useQueryClient()

  // Functions

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
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

        queryClient.invalidateQueries({
          queryKey: [
            'get',
            '/select/{model}',
            {
              params: {
                path: {
                  model: 'unit'
                },
                query: {
                  ...queryParams
                }
              }
            }
          ]
        })

        onChange?.({ value: res?.data?.id, label: res?.data?.title })
        handleCloseDrawer()
      })
      .catch(e => {
        setFormErrors(e, setError)
      })
  }

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleCloseDrawer = () => {
    formDrawerRef?.current?.close()
    reset()
  }

  return (
    <div className='flex items-center gap-x-2'>
      <MuiAutocomplete
        loadingText={keywordsTranslate?.loading}
        className='flex-grow'
        noOptionsText={keywordsTranslate?.noDataAvailable}
        open={open}
        onOpen={handleOpen}
        multiple={multiple}
        onClose={handleClose}
        isOptionEqualToValue={(option, value) => {
          const optionLabel = typeof option === 'string' ? option : (option as OptionType)?.value
          const valueLabel = typeof value === 'string' ? value : (value as OptionType)?.value

          return optionLabel === valueLabel
        }}
        getOptionLabel={option => (typeof option === 'string' ? option : (option as OptionType)?.label)}
        filterSelectedOptions={multiple ?? false}
        options={unitsListData?.data ?? []}
        value={value}
        onChange={(_, data) => onChange?.(data)}
        loading={isLoadingUnitsList}
        renderInput={params => (
          <DebouncedInput
            {...params}
            error={error}
            label={label}
            value={queryParams.filter?.search ?? ''}
            onChange={value =>
              setQueryParams(prev => ({
                ...prev,
                filter: {
                  ...prev.filter,
                  search: value
                }
              }))
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {isLoadingUnitsList ? <CircularProgress color='inherit' size={20} /> : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              )
            }}
          />
        )}
      />

      {addOption && (
        <CustomIconButton
          size='large'
          variant='outlined'
          color='primary'
          className='!min-h-fit'
          onClick={() => formDrawerRef.current?.open()}
        >
          <i className='ri-add-line' />
        </CustomIconButton>
      )}
      <FormDrawer ref={formDrawerRef} title={unitTranslate?.add_new_unit ?? ''}>
        <div className='flex flex-col gap-y-6 p-5'>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>{keywordsTranslate?.type}</InputLabel>
            <Controller
              name='type'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select label={keywordsTranslate?.type} {...field}>
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
                  placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.name ?? '')}
                  label={keywordsTranslate?.name}
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
                  placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.value ?? '')}
                  label={keywordsTranslate?.value}
                  {...(errors.value && { error: true, helperText: errors.value.message })}
                />
              )
            }}
          />
          <FormControl fullWidth error={!!errors.published}>
            <InputLabel>{keywordsTranslate?.status}</InputLabel>
            <Controller
              name='published'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select label={keywordsTranslate?.status} {...field}>
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
          <LoadingButton variant='contained' type='submit' loading={isAddingUnit} onClick={handleSubmit(onSubmit)}>
            {keywordsTranslate?.save}
          </LoadingButton>
        </Box>
      </FormDrawer>
    </div>
  )
}

export default UnitAutocomplete
