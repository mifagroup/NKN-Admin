'use client'

// React Imports
import { forwardRef, useEffect, useRef } from 'react'

// Third-party Imports
import { Box, FormControl, LinearProgress } from '@mui/material'
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
import type { IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'
import AutoComplete from '@/@core/components/autoComplete/AutoComplete'
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import { useStatuses } from '@/@core/hooks/useStatuses'
import TextField from '@/@core/components/textField'

interface AttributesGroupFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  selectedItem?: { id: number | undefined; status: 'editing' | 'deleting' | 'adding' }
  listQueryParams: Partial<components['parameters']>
}

const AttributesGroupForm = forwardRef<DrawerHandle, AttributesGroupFormProps>(
  ({ dictionary, selectedItem, listQueryParams }, ref) => {
    // Vars
    const keywordsTranslate = dictionary?.keywords

    const inputTranslate = dictionary?.input

    type FormData = z.infer<typeof schema>

    // Schema
    const schema = z.object({
      title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
      description: z.string().optional(),
      attribute_ids: z.union([
        z
          .array(
            z.object({
              label: z.string().optional(),
              value: z.number().optional()
            })
          )
          .optional(),
        z.null()
      ])
    })

    // Hooks

    const statuses = useStatuses()

    const queryClient = useQueryClient()

    const { queryParams, setQueryParams } = useQueryParams()

    const attributesAutoCompleteRef = useRef<IAutocompleteRef>(null)

    const {
      data: singleAttributesGroupData,
      isLoading: isLoadingAttributesGroup,
      isFetching
    } = useFetch().useQuery(
      'get',
      '/attribute-group/{attributeGroup}',
      {
        params: {
          path: {
            attributeGroup: selectedItem?.id ?? 0
          }
        }
      },
      {
        enabled: !!selectedItem?.id
      }
    )

    const singleAttributesGroup = singleAttributesGroupData?.data

    useEffect(() => {
      if (!isFetching && selectedItem?.status === 'editing') {
        handleOpenDrawer()
        setValue('title', singleAttributesGroup?.title ?? '')
        setValue('description', singleAttributesGroup?.description ?? '')
        setValue(
          'attribute_ids',
          singleAttributesGroup?.attributes?.map(attr => ({
            label: attr.title,
            value: attr.id
          }))
        )
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFetching, selectedItem?.status, selectedItem?.id])

    useEffect(() => {
      if (selectedItem?.status === 'adding') reset()
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItem?.status])

    const { mutateAsync: addAttributesGroup, isPending: isAddingAttributesGroup } = useFetch().useMutation(
      'post',
      '/attribute-group'
    )

    const { mutateAsync: editAttributesGroup, isPending: isEditingAttributesGroup } = useFetch().useMutation(
      'put',
      '/attribute-group/{attributeGroup}'
    )

    const { data, isLoading: isLoadingAttributes } = useFetch().useQuery('get', '/attribute', {
      params: {
        query: queryParams
      }
    })

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
        title: '',
        description: '',
        attribute_ids: []
      }
    })

    // Vars
    const attributesOptions = data?.data?.map(attr => ({
      label: attr.title,
      value: attr.id
    }))

    // Functions
    const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
      if (!selectedItem?.id) {
        await addAttributesGroup({
          body: {
            ...data,
            attribute_ids: data.attribute_ids?.map(attr => attr.value ?? 0),
            description: data.description ?? ''
          }
        })
          .then(res => {
            toast.success(res.message)
            handleCloseDrawer()
            queryClient.invalidateQueries({
              queryKey: [
                'get',
                '/attribute-group',
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
            for (const [key, messages] of Object?.entries(e.errors)) {
              setError(key as keyof FormData, {
                type: 'manual',
                message: (messages as string[])[0]
              })
            }
          })
      } else {
        await editAttributesGroup({
          body: {
            ...data,
            attribute_ids: data.attribute_ids?.map(attr => attr.value ?? 0),
            description: data.description ?? ''
          },
          params: {
            path: {
              attributeGroup: selectedItem?.id
            }
          }
        })
          .then(res => {
            toast.success(res.message)
            handleCloseDrawer()
            queryClient.invalidateQueries({
              queryKey: [
                'get',
                '/attribute-group',
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
            for (const [key, messages] of Object?.entries(e.errors)) {
              setError(key as keyof FormData, {
                type: 'manual',
                message: (messages as string[])[0]
              })
            }
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
        title={`${keywordsTranslate.add} ${keywordsTranslate.group} ${keywordsTranslate.attribute}`}
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
            <FormControl fullWidth>
              <Controller
                name='attribute_ids'
                control={control}
                render={({ field }) => {
                  return (
                    <AutoComplete
                      {...field}
                      multiple
                      open={false}
                      value={field.value}
                      onChange={(_, data) => field.onChange(data)}
                      ref={attributesAutoCompleteRef}
                      options={attributesOptions ?? []}
                      loading={isLoadingAttributes}
                      handleInputChange={value =>
                        setQueryParams(prevParams => ({
                          ...prevParams,
                          filter: {
                            ...prevParams.filter,
                            search: value
                          }
                        }))
                      }
                      inputValue={queryParams.filter?.search ?? ''}
                      label={keywordsTranslate.attributes}
                    />
                  )
                }}
              />
            </FormControl>
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.description)}
                  label={keywordsTranslate.description}
                />
              )}
            />
          </div>
          <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'} paddingX={5}>
            <LoadingButton variant='outlined' color='error' onClick={handleCloseDrawer}>
              {keywordsTranslate?.cancel}
            </LoadingButton>
            <LoadingButton
              variant='contained'
              type='submit'
              loading={isAddingAttributesGroup || isEditingAttributesGroup}
            >
              {keywordsTranslate?.save}
            </LoadingButton>
          </Box>
        </form>
      </FormDrawer>
    )
  }
)

export default AttributesGroupForm
