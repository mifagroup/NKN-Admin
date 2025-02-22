'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography
} from '@mui/material'
import { type SubmitHandler, Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import LoadingButton from '@mui/lab/LoadingButton'
import { toast } from 'react-toastify'

// Hook Imports
import { useFetch } from '@/utils/clientRequest'
import { translateReplacer } from '@/utils/translateReplacer'

// Component Imports
import { type components } from '@/@core/api/v1'
import type { getDictionary } from '@/utils/getDictionary'
import AddAttributeValues from '../create/AddAttributeValues'
import { setFormErrors } from '@/utils/setFormErrors'
import Link from '@/components/Link'
import { menuUrls } from '@/@menu/utils/menuUrls'
import TextField from '@/@core/components/textField'

const AttributeForm = ({ dictionary, id }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; id?: number }) => {
  // States
  const [attributeResponse, setAttributeResponse] = useState<components['schemas']['AttributeResource'] | undefined>(
    undefined
  )

  const [attributeValuesCount, setAttributeValuesCount] = useState(1)

  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary.keywords

  const inputTranslate = dictionary.input

  const attributeTranslate = dictionary.product_management.attributes

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    type: z.enum(['text', 'color'], {
      required_error: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}`
    }),
    filterable: z.boolean().optional(),
    comparable: z.boolean().optional(),
    special: z.boolean().optional(),
    order: z.string()
  })

  // Hooks

  const { data: singleAttributeValuesData, isLoading: isLoadingSingleAttributeValues } = useFetch().useQuery(
    'get',
    '/{attribute}/attribute-value',
    {
      params: {
        path: {
          attribute: id ?? 0
        },
        query: {
          per_page: -1
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleAttributeValues = singleAttributeValuesData?.data

  useEffect(() => {
    if (singleAttributeValues) {
      setAttributeValuesCount(singleAttributeValues.length + 1)
    }
  }, [singleAttributeValues])

  const { data: singleAttributeData, isLoading: isLoadingSingleAttribute } = useFetch().useQuery(
    'get',
    '/attribute/{attribute}',
    {
      params: {
        path: {
          attribute: id ?? 0
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleAttribute = singleAttributeData?.data

  useEffect(() => {
    if (singleAttribute) {
      setValue('title', singleAttribute.title ?? '')
      setValue('type', (singleAttribute.type?.value as 'text' | 'color') ?? 'text')
      setValue('filterable', singleAttribute.filterable ?? true)
      setValue('comparable', singleAttribute.comparable ?? true)
      setValue('special', singleAttribute.special ?? false)
      setValue('order', singleAttribute.order?.toString())
      setAttributeResponse(singleAttribute as components['schemas']['AttributeResource'])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleAttribute])

  const {
    mutateAsync: addAttribute,
    isPending: isAddingAttribute,
    isSuccess
  } = useFetch().useMutation('post', '/attribute')

  const { mutateAsync: editAttribute, isPending: isEditingAttribute } = useFetch().useMutation(
    'put',
    '/attribute/{attribute}'
  )

  const { data } = useFetch().useQuery('get', '/attribute/data')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      type: 'text',
      comparable: true,
      filterable: true,
      special: false,
      order: '1'
    }
  })

  // Vars
  const typesValues = data?.data?.types

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!id) {
      await addAttribute({
        body: {
          title: data.title,
          type: data.type,
          filterable: data.filterable ? 1 : 0,
          comparable: data.comparable ? 1 : 0,
          special: data.special ? 1 : 0,
          order: data.order ? parseInt(data.order) : 0
        }
      })
        .then(res => {
          toast.success(res.message)

          setAttributeResponse(res.data)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editAttribute({
        body: {
          title: data.title,
          type: data.type,
          filterable: data.filterable ? 1 : 0,
          comparable: data.comparable ? 1 : 0,
          special: data.special ? 1 : 0,
          order: data.order ? parseInt(data.order) : 0
        },
        params: {
          path: {
            attribute: id
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          router.push(menuUrls.product_management.attribute.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isLoadingSingleAttribute) {
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
                    {id ? attributeTranslate.editAttributeTitle : attributeTranslate.addNewAttributeTitle}
                  </Typography>
                </div>
                {!isSuccess ? (
                  <LoadingButton variant='contained' type='submit' loading={isAddingAttribute || isEditingAttribute}>
                    {keywordsTranslate.save}
                  </LoadingButton>
                ) : (
                  <Button variant='outlined' LinkComponent={Link} href={menuUrls.product_management.attribute.list}>
                    {keywordsTranslate.returnToList}
                  </Button>
                )}
              </div>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Grid container spacing={5} className=''>
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
                            disabled={!!attributeResponse && !id}
                            {...(errors.title && { error: true, helperText: errors.title.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <FormControl fullWidth error={!!errors.type}>
                        <InputLabel>{keywordsTranslate.type}</InputLabel>
                        <Controller
                          name='type'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select label={keywordsTranslate.type} {...field} disabled={!!attributeResponse && !id}>
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
                    </Grid>
                    <Grid item xs={12} lg={4}>
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
                            disabled={!!attributeResponse && !id}
                            {...(errors.order && { error: true, helperText: errors.order.message })}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                  {/* <Typography className='mbe-1'>Description (Optional)</Typography> */}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card>
                <CardContent>
                  <Grid container spacing={5} className=''>
                    <Grid item xs={12}>
                      <Controller
                        name='filterable'
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            {...field}
                            control={<Checkbox checked={field.value} disabled={!!attributeResponse && !id} />}
                            label={keywordsTranslate.filterable}
                          />
                        )}
                      />

                      {errors.filterable ? (
                        <FormHelperText error>{errors.filterable?.message}</FormHelperText>
                      ) : (
                        <Typography variant='subtitle2'>{attributeTranslate.filterableHint}</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='comparable'
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            {...field}
                            control={<Checkbox checked={field.value} disabled={!!attributeResponse && !id} />}
                            label={keywordsTranslate.comparable}
                          />
                        )}
                      />
                      {errors.comparable ? (
                        <FormHelperText error>{errors.comparable?.message}</FormHelperText>
                      ) : (
                        <Typography variant='subtitle2'>{attributeTranslate.comparableHint}</Typography>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='special'
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            {...field}
                            control={<Checkbox checked={field.value} disabled={!!attributeResponse && !id} />}
                            label={keywordsTranslate.special}
                          />
                        )}
                      />
                      {errors.special ? (
                        <FormHelperText error>{errors.special?.message}</FormHelperText>
                      ) : (
                        <Typography variant='subtitle2'>{attributeTranslate.specialHint}</Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Grid>
      <Grid xs={12} item>
        <Divider />
      </Grid>
      {attributeResponse && (
        <Grid xs={12} item container spacing={6}>
          <Grid item xs={12}>
            <div className='flex flex-wrap sm:items-center justify-between max-sm:flex-col gap-6'>
              <div>
                <Typography variant='h4' className='mbe-1'>
                  {attributeTranslate.attributeValues}
                </Typography>
              </div>
              <div className='flex flex-wrap max-sm:flex-col gap-4'></div>
            </div>
          </Grid>

          {
            <>
              {isLoadingSingleAttributeValues ? (
                <Grid xs={12} display={'flex'} justifyContent={'center'}>
                  <CircularProgress />
                </Grid>
              ) : (
                <>
                  {[...Array(attributeValuesCount)]?.map((_, index) => (
                    <AddAttributeValues
                      key={index}
                      dictionary={dictionary}
                      attribute={attributeResponse}
                      setAttributeValuesCount={setAttributeValuesCount}
                      attributeValue={singleAttributeValues?.[index]}
                      isEditing={!!id}
                    />
                  ))}
                </>
              )}
            </>
          }
        </Grid>
      )}
    </Grid>
  )
}

export default AttributeForm
