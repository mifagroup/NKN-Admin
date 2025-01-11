'use client'

// React Imports
import { forwardRef, useEffect, useRef } from 'react'

// MUI Imports
import { Box, LinearProgress } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import type { components } from '@/@core/api/v1'
import type { getDictionary } from '@/utils/getDictionary'
import type { IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'

// Component Imports
import type { DrawerHandle } from '@/@core/components/drawers/FormDrawer'
import FormDrawer from '@/@core/components/drawers/FormDrawer'
import DropZone from '@/@core/components/dropzone/DropZone'

// Util Imports
import { useFetch } from '@/utils/clientRequest'
import { setFormErrors } from '@/utils/setFormErrors'
import AutoComplete from '@/@core/components/autoComplete/AutoComplete'
import type { ImageMimeType, VideoMimeType } from '@/@core/types'
import TextField from '@/@core/components/textField'

type TagFormProps = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  selectedItem?: { id: number | undefined; status: 'editing' | 'deleting' | 'adding' }
  listQueryParams: Partial<components['parameters']>
}

const TagForm = forwardRef<DrawerHandle, TagFormProps>(({ dictionary, selectedItem, listQueryParams }, ref) => {
  // Vars
  const keywordsTranslate = dictionary.keywords

  const tagsRef = useRef<IAutocompleteRef>(null)

  // Schema
  const schema = z.object({
    name: z.string({ required_error: `${keywordsTranslate.name} ${keywordsTranslate.isRequired}` }),
    type: z.string().optional(),
    order_column: z.string().optional(),
    image: z
      .union([
        z.string({ required_error: `${keywordsTranslate.image} ${keywordsTranslate.isRequired}` }).optional(),
        z.instanceof(File, { message: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` }).optional()
      ])
      .optional()
  })

  type FormData = z.infer<typeof schema>

  // functions

  const handleOpenDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.open()

  const handleCloseDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.close()

  // Hooks

  const queryClient = useQueryClient()

  const { data: singleTagData, isFetching: isFetchingSingleTag } = useFetch().useQuery(
    'get',
    '/tag/{tag}',
    {
      params: {
        path: {
          tag: selectedItem?.id ?? 0
        }
      }
    },
    {
      enabled: !!selectedItem?.id
    }
  )

  const { data: tagsOptionsData } = useFetch().useQuery('get', '/tag/data')

  const { mutateAsync: addTag, isPending: isAddingTag } = useFetch().useMutation('post', '/tag')

  const { mutateAsync: editTag, isPending: isEditingTag } = useFetch().useMutation('put', '/tag/{tag}')

  const singleTag = singleTagData?.data

  const tagOptions = tagsOptionsData?.data?.types

  const {
    formState: { errors },
    handleSubmit,
    control,
    setError,
    setValue,
    reset
  } = useForm<FormData>({
    defaultValues: {},
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if (!isFetchingSingleTag && selectedItem?.status === 'editing') {
      handleOpenDrawer()
      setValue('name', singleTag?.name ?? '')
      setValue('type', singleTag?.type ?? '')
      setValue('order_column', singleTag?.order_column?.toString() ?? '')
      setValue('image', singleTag?.image?.original_url ?? '')
    } else {
      reset()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetchingSingleTag, selectedItem, singleTag])

  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const formData = new FormData()

    formData.append('name', data?.name)
    formData.append('type', data?.type ?? '')
    formData.append('order_column', data?.order_column ?? '')

    if (data.image && data.image instanceof File) {
      formData.append('image', data.image)
    }

    if (!selectedItem?.id) {
      await addTag({
        body: formData as any
      })
        .then(res => {
          toast.success(res?.message)
          handleCloseDrawer()
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/tag',
              {
                params: {
                  query: listQueryParams
                }
              }
            ]
          })
        })
        .catch(error => {
          setFormErrors(error, setError)
        })
    } else {
      await editTag({
        body: formData as any,
        params: {
          path: {
            tag: selectedItem?.id
          }
        }
      })
        .then(res => {
          toast.success(res?.message)
          handleCloseDrawer()
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/tag',
              {
                params: {
                  query: listQueryParams
                }
              }
            ]
          })
        })
        .catch(error => {
          setFormErrors(error, setError)
        })
    }
  }

  if (selectedItem?.id && isFetchingSingleTag) {
    return <LinearProgress />
  }

  return (
    <FormDrawer
      title={`${selectedItem?.id ? keywordsTranslate.edit : keywordsTranslate.add} ${keywordsTranslate.tag}`}
      ref={ref}
    >
      <form autoComplete='off' noValidate onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-y-6 p-5'>
          <Controller
            name='name'
            rules={{ required: true }}
            control={control}
            render={({ field }) => {
              return (
                <TextField
                  {...field}
                  fullWidth
                  autoFocus
                  type='text'
                  label={keywordsTranslate.name}
                  {...(errors.name && { error: true, helperText: errors.name.message })}
                />
              )
            }}
          />

          <Controller
            name='type'
            control={control}
            render={({ field }) => {
              return (
                <AutoComplete
                  {...field}
                  label={keywordsTranslate.type}
                  ref={tagsRef}
                  {...(errors.type && {
                    error: true,
                    helperText: errors.type.message
                  })}
                  open={false}
                  value={field?.value}
                  onChange={(_, data: any) => {
                    field?.onChange(data?.value ?? '')
                  }}
                  options={tagOptions}
                />
              )
            }}
          />

          <Controller
            name='order_column'
            control={control}
            render={({ field }) => {
              return (
                <TextField
                  {...field}
                  fullWidth
                  type='number'
                  label={keywordsTranslate.ordering}
                  {...(errors.order_column && { error: true, helperText: errors.order_column.message })}
                />
              )
            }}
          />
          <Controller
            name='image'
            control={control}
            render={({ field }) => (
              <DropZone
                files={field.value ? (typeof field.value === 'string' ? [field.value] : [field.value as File]) : []}
                setFiles={(images: any) => field.onChange(images[0])}
                mimeType={selectedItem?.id ? (singleTag?.image?.mime_type as ImageMimeType | VideoMimeType) : undefined}
                type='image'
                error={!!errors.image}
              />
            )}
          />
          <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'}>
            <LoadingButton variant='outlined' color='error' onClick={handleCloseDrawer}>
              {keywordsTranslate?.cancel}
            </LoadingButton>
            <LoadingButton variant='contained' type='submit' loading={isAddingTag || isEditingTag}>
              {keywordsTranslate?.save}
            </LoadingButton>
          </Box>
        </div>
      </form>
    </FormDrawer>
  )
})

export default TagForm
