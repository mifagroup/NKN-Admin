'use client'

// React Imports
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'

// Third-party Imports
import { Card, CardContent, Grid } from '@mui/material'
import { type SubmitHandler, Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-toastify'
import LoadingButton from '@mui/lab/LoadingButton'

// Type Imports
import { type getDictionary } from '@/utils/getDictionary'
import { type components } from '@/@core/api/v1'

// Utils Imports
import { useFetch } from '@/utils/clientRequest'
import { translateReplacer } from '@/utils/translateReplacer'
import { useStatuses } from '@/@core/hooks/useStatuses'
import { setFormErrors } from '@/utils/setFormErrors'
import TextField from '@/@core/components/textField'

const AddAttributeValues = ({
  dictionary,
  attribute,
  setAttributeValuesCount,
  attributeValue,
  isEditing = false
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  attribute: components['schemas']['AttributeResource']
  setAttributeValuesCount: Dispatch<SetStateAction<number>>
  attributeValue?: components['schemas']['AttributeValueResource']
  isEditing?: boolean
}) => {
  // States
  const [addAttributeValueResponse, setAddAttributeValueResponse] = useState<
    components['schemas']['AttributeValueResource'] | undefined
  >()

  const [deleteStatus, setDeleteStatus] = useState(false)

  // Vars
  const keywordsTranslate = dictionary.keywords

  const inputTranslate = dictionary.input

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    attribute_id: z.number({ required_error: `${keywordsTranslate.attribute} ${keywordsTranslate.isRequired}` }),
    order: z.string().optional()
  })

  // Hooks
  const statuses = useStatuses()

  const { mutateAsync: addAttributeValue, isPending: isAddingAttributeValue } = useFetch().useMutation(
    'post',
    '/{attribute}/attribute-value'
  )

  const { mutateAsync: editAttributeValue, isPending: isEditingAttributeValue } = useFetch().useMutation(
    'put',
    '/{attribute}/attribute-value/{attributeValue}'
  )

  const { mutateAsync: deleteAttributeValue, isPending: isDeletingAttributeValue } = useFetch().useMutation(
    'delete',
    '/{attribute}/attribute-value/{attributeValue}'
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      order: '1',
      attribute_id: attribute.id
    }
  })

  useEffect(() => {
    if (attributeValue) {
      setValue('title', attributeValue.title ?? '')
      setValue('order', attributeValue.order?.toString() ?? '')
      setValue('attribute_id', attribute.id ?? 0)
      setAddAttributeValueResponse(attributeValue)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeValue])

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!addAttributeValueResponse) {
      await addAttributeValue({
        body: {
          ...data,
          order: data.order ? parseInt(data.order) : 0
        },
        params: {
          path: {
            attribute: attribute.id ?? 0
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          setAttributeValuesCount(count => count + 1)
          setAddAttributeValueResponse(res.data)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editAttributeValue({
        body: {
          ...data,
          order: data.order ? parseInt(data.order) : 0
        },
        params: {
          path: {
            attributeValue: addAttributeValueResponse.id ?? 0,
            attribute: attribute.id ?? 0
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          setAddAttributeValueResponse(res.data)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  const handleDeleteAttribute = async () => {
    if (addAttributeValueResponse) {
      await deleteAttributeValue({
        params: {
          path: {
            attribute: attribute.id ?? 0,
            attributeValue: addAttributeValueResponse.id ?? 0
          }
        }
      }).then(res => {
        toast.success(res.message)
        setAddAttributeValueResponse(undefined)
        setDeleteStatus(true)
      })
    }
  }

  if (deleteStatus) return null

  return (
    <Grid xs={12} item>
      <Card>
        <CardContent>
          <Grid item xs={12}>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={5} className=''>
                <Grid item xs={12} md={5}>
                  <Controller
                    name='title'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        autoFocus={!isEditing}
                        type='text'
                        placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.title)}
                        label={keywordsTranslate.title}
                        {...(errors.title && { error: true, helperText: errors.title.message })}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
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

                <Grid item xs={12} md={2} display={'flex'} columnGap={6}>
                  <LoadingButton
                    variant='contained'
                    type='submit'
                    loading={isAddingAttributeValue || isEditingAttributeValue}
                    className='!max-h-[56px] !w-full'
                  >
                    {addAttributeValueResponse ? keywordsTranslate.edit : keywordsTranslate.save}
                  </LoadingButton>
                  {addAttributeValueResponse && (
                    <LoadingButton
                      variant='outlined'
                      color='error'
                      loading={isDeletingAttributeValue}
                      onClick={handleDeleteAttribute}
                      className='!min-h-[56px] !w-full'
                    >
                      {keywordsTranslate.delete}
                    </LoadingButton>
                  )}
                </Grid>
              </Grid>
            </form>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default AddAttributeValues
