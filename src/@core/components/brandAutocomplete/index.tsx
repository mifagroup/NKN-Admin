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
import { type operations } from '@/@core/api/v1'
import TextField from '../textField'
import type { OptionType } from '@/@core/types'

type IAutocompleteProps = {
  error?: boolean
  label: string
  multiple?: boolean
  value?: { value?: string | number | undefined; label?: string | undefined } | null | undefined
  onChange?: (data: any) => void
  addOption?: boolean
}

const BrandAutocomplete = ({
  error = false,
  multiple = false,
  label,
  value,
  onChange,
  addOption = true
}: IAutocompleteProps) => {
  // States

  const [open, setOpen] = useState(false)

  // Hooks

  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const inputTranslate = dictionary?.input

  const brandTranslate = dictionary?.product_management.brands

  type FormData = z.infer<typeof schema>

  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate?.title} ${keywordsTranslate?.isRequired}` }),
    image: z.union([
      z.string({ required_error: `${keywordsTranslate?.image} ${keywordsTranslate?.isRequired}` }),
      z.instanceof(File, { message: `${keywordsTranslate?.type} ${keywordsTranslate?.isRequired}` })
    ]),
    published: z.string(),
    ordering: z.string()
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
      published: '1',
      ordering: '1'
    }
  })

  const { queryParams, setQueryParams } = useQueryParams<operations['selectByModel']['parameters']['query']>()

  const { data: BrandsData, isLoading: isLoadingBrands } = useFetch().useQuery('get', '/select/{model}', {
    params: {
      path: {
        model: 'brand'
      },
      query: {
        ...queryParams
      }
    }
  })

  const { mutateAsync: addBrand, isPending: isAddingBrand } = useFetch().useMutation('post', '/brand')

  const queryClient = useQueryClient()

  // Functions

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const formData = new FormData()

    formData.append('title', data.title)
    formData.append('published', data.published)
    formData.append('ordering', data.ordering)

    if (data.image && data.image instanceof File) {
      formData.append('image', data.image)
    }

    await addBrand({
      body: formData as any
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
                  model: 'brand'
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
        options={BrandsData?.data ?? []}
        value={value}
        onChange={(_, data) => onChange?.(data)}
        loading={isLoadingBrands}
        renderInput={params => (
          <DebouncedInput
            {...params}
            error={error}
            label={label}
            value={queryParams?.filter?.search ?? ''}
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
                  {isLoadingBrands ? <CircularProgress color='inherit' size={20} /> : null}
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
      <FormDrawer ref={formDrawerRef} title={brandTranslate?.addNewBrandTitle ?? ''}>
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
                  placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.title ?? '')}
                  label={keywordsTranslate?.title}
                  {...(errors.title && { error: true, helperText: errors.title.message })}
                />
              )
            }}
          />
          <Controller
            name='ordering'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='number'
                placeholder={translateReplacer(inputTranslate?.placeholder ?? '', keywordsTranslate?.ordering ?? '')}
                label={keywordsTranslate?.ordering}
                {...(errors.ordering && { error: true, helperText: errors.ordering.message })}
              />
            )}
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
          <FormControl fullWidth className='flex flex-col gap-y-2'>
            <FormLabel>{keywordsTranslate?.image}</FormLabel>
            <Controller
              name='image'
              control={control}
              render={({ field }) => (
                <DropZone
                  files={field.value ? (typeof field.value === 'string' ? [field.value] : [field.value as File]) : []}
                  setFiles={(images: any) => field.onChange(images[0])}
                  type='image'
                />
              )}
            />

            {errors.image && <FormHelperText error>{errors.image?.message}</FormHelperText>}
          </FormControl>
        </div>
        <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'} paddingX={5}>
          <LoadingButton variant='outlined' color='error' onClick={handleCloseDrawer}>
            {keywordsTranslate?.cancel}
          </LoadingButton>
          <LoadingButton variant='contained' type='submit' loading={isAddingBrand} onClick={handleSubmit(onSubmit)}>
            {keywordsTranslate?.save}
          </LoadingButton>
        </Box>
      </FormDrawer>
    </div>
  )
}

export default BrandAutocomplete
