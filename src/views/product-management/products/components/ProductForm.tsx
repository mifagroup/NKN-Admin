'use client'

// React Imports
import { forwardRef, useEffect } from 'react'

// Third-party Imports
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material'
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
import { setFormErrors } from '@/utils/setFormErrors'
import CategoryAutoComplete from '@/@core/components/categoryAutocomplete'
import TextField from '@/@core/components/textField'

interface UnitFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  selectedItem?: { id: number | undefined; status: 'deleting' | 'adding' | 'toggling' }
  listQueryParams: Partial<components['parameters']>
}

const ProductForm = forwardRef<DrawerHandle, UnitFormProps>(({ dictionary, selectedItem, listQueryParams }, ref) => {
  // Vars
  const keywordsTranslate = dictionary?.keywords

  const inputTranslate = dictionary?.input

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    type: z.string({
      required_error: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}`
    }) as z.ZodType<components['schemas']['ProductInterfaceTypeEnum']['value']>,
    category_id: z.object(
      {
        label: z.string().optional(),
        value: z.number().optional()
      },
      { required_error: `${keywordsTranslate.category} ${keywordsTranslate.isRequired}` }
    )
  })

  // Hooks
  const queryClient = useQueryClient()

  useEffect(() => {
    if (selectedItem?.status === 'adding') reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem?.status])

  const { data } = useFetch().useQuery('get', '/product-interface/data')

  const typesValues = data?.data?.product_interfaces_types

  const { mutateAsync: addProductInterface, isPending: isAddingProductInterface } = useFetch().useMutation(
    'post',
    '/product-interface'
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {}
  })

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    await addProductInterface({
      body: {
        title: data.title,
        category_id: data.category_id.value ?? 0,
        type: data.type
      }
    })
      .then(res => {
        toast.success(res.message)
        handleCloseDrawer()
        queryClient.invalidateQueries({
          queryKey: [
            'get',
            '/product-interface',
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

  const handleCloseDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.close()

  const handleOpenDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.open()

  return (
    <FormDrawer title={`${keywordsTranslate.add} ${keywordsTranslate.product}`} ref={ref}>
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
                  placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.name)}
                  label={keywordsTranslate.name}
                  {...(errors.title && { error: true, helperText: errors.title.message })}
                />
              )
            }}
          />
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
                    type='product'
                  />
                )
              }}
            />
            {errors.category_id && <FormHelperText error>{errors.category_id?.message}</FormHelperText>}
          </FormControl>
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel>{keywordsTranslate.type}</InputLabel>
            <Controller
              name='type'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select label={keywordsTranslate.type} {...field}>
                  {typesValues?.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.type && <FormHelperText error>{errors.type.message}</FormHelperText>}
          </FormControl>
        </div>
        <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'} paddingX={5}>
          <LoadingButton variant='outlined' color='error' onClick={handleCloseDrawer}>
            {keywordsTranslate?.cancel}
          </LoadingButton>
          <LoadingButton variant='contained' type='submit' loading={isAddingProductInterface}>
            {keywordsTranslate?.save}
          </LoadingButton>
        </Box>
      </form>
    </FormDrawer>
  )
})

export default ProductForm
