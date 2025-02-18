'use client'

// React Imports
import { forwardRef, useEffect } from 'react'

import { useRouter } from 'next/navigation'

// Third-party Imports
import { Card, CardContent, FormHelperText, FormLabel, Grid, LinearProgress, Typography } from '@mui/material'
import { type SubmitHandler, Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import LoadingButton from '@mui/lab/LoadingButton'

// Hook Imports
import { useQueryClient } from '@tanstack/react-query'

import { useFetch } from '@/utils/clientRequest'
import { translateReplacer } from '@/utils/translateReplacer'

// Component Imports
import type { getDictionary } from '@/utils/getDictionary'
import { type DrawerHandle } from '@/@core/components/drawers/FormDrawer'
import { useStatuses } from '@/@core/hooks/useStatuses'
import { setFormErrors } from '@/utils/setFormErrors'
import TextField from '@/@core/components/textField'
import { menuUrls } from '@/@menu/utils/menuUrls'
import DropZone from '@/@core/components/dropzone/DropZone'
import type { ImageMimeType } from '@/@core/types'

interface HospitalFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  id?: number
}

const HospitalForm = forwardRef<DrawerHandle, HospitalFormProps>(({ dictionary, id }) => {
  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary?.keywords

  const inputTranslate = dictionary?.input

  const hospitalTranslate = dictionary.hospital

  const validationTranslate = dictionary.unique_validation_errors

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    name: z.string({ required_error: `${keywordsTranslate.name} ${keywordsTranslate.isRequired}` }),
    fax: z.string({ required_error: `${keywordsTranslate.fax} ${keywordsTranslate.isRequired}` }),
    address: z.string().optional(),
    address_link: z.string().url({ message: validationTranslate.valid_link }).optional(),
    email: z.string().email({ message: validationTranslate.valid_email }).optional(),
    image: z.union([
      z.string({ required_error: `${keywordsTranslate.image} ${keywordsTranslate.isRequired}` }),
      z.instanceof(File, { message: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` })
    ]),
    thumbnail: z.union([
      z.string({ required_error: `${keywordsTranslate.image} ${keywordsTranslate.isRequired}` }),
      z.instanceof(File, { message: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` })
    ]),
    main_thumbnail: z.union([
      z.string({ required_error: `${keywordsTranslate.image} ${keywordsTranslate.isRequired}` }),
      z.instanceof(File, { message: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` })
    ])
  })

  // Hooks
  const queryClient = useQueryClient()

  const statuses = useStatuses()

  const {
    data: singleHospitalData,
    isLoading: isLoadingHospital,
    isFetching
  } = useFetch().useQuery(
    'get',
    '/hospitals/{id}',
    {
      params: {
        path: {
          id: id ?? 0
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleHospital = singleHospitalData?.data

  useEffect(() => {
    if (singleHospital) {
      setValue('name', singleHospital?.name ?? '')
      setValue('fax', singleHospital?.fax ?? '')
      setValue('email', singleHospital?.email ?? '')
      setValue('address', singleHospital?.address ?? '')
      setValue('address_link', singleHospital?.address_link ?? '')
      setValue('image', singleHospital?.image?.original_url ?? '')
      setValue('thumbnail', singleHospital?.thumbnail?.original_url ?? '')
      setValue('main_thumbnail', singleHospital?.main_thumbnail?.original_url ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleHospital])

  const { mutateAsync: addHospital, isPending: isAddingHospital } = useFetch().useMutation('post', '/hospitals')

  const { mutateAsync: editHospital, isPending: isEditingHospital } = useFetch().useMutation('put', '/hospitals/{id}')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {}
  })

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('fax', data.fax ?? '')
    formData.append('email', data.email ?? '')
    formData.append('address', data.address ?? '')
    formData.append('address_link', data.address_link ?? '')

    if (data.image && data.image instanceof File) {
      formData.append('image', data.image)
    }

    if (data.thumbnail && data.thumbnail instanceof File) {
      formData.append('thumbnail', data.thumbnail)
    }

    if (data.main_thumbnail && data.main_thumbnail instanceof File) {
      formData.append('main_thumbnail', data.main_thumbnail)
    }

    if (!id) {
      await addHospital({
        body: formData as any
      })
        .then(res => {
          // toast.success(res.message)
          router.push(menuUrls.hospitals.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editHospital({
        body: formData as any,
        params: {
          path: {
            id: id
          }
        }
      })
        .then(res => {
          // toast.success(res.message)
          router.push(menuUrls.hospitals.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isFetching) {
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
                    {id ? hospitalTranslate.editHospitalTitle : hospitalTranslate.addNewHospitalTitle}
                  </Typography>
                </div>
                <div className='flex flex-wrap max-sm:flex-col gap-4'>
                  <LoadingButton variant='contained' type='submit' loading={isAddingHospital || isEditingHospital}>
                    {keywordsTranslate.save}
                  </LoadingButton>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='name'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            autoFocus
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.name)}
                            label={keywordsTranslate.name}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.name && { error: true, helperText: errors.name.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='fax'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.fax)}
                            label={keywordsTranslate.fax}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.fax && { error: true, helperText: errors.fax.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='email'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='email'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.email)}
                            label={keywordsTranslate.email}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.email && { error: true, helperText: errors.email.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='address'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.address)}
                            label={keywordsTranslate.address}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.address && { error: true, helperText: errors.address.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='address_link'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.address_link)}
                            label={keywordsTranslate.address_link}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.address_link && { error: true, helperText: errors.address_link.message })}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4} display={'flex'} flexDirection={'column'} rowGap={5}>
              <Card>
                <CardContent>
                  <Grid container spacing={5} className=''>
                    <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
                      <FormLabel>{keywordsTranslate.image}</FormLabel>
                      <Controller
                        name='image'
                        control={control}
                        render={({ field }) => (
                          <DropZone
                            files={
                              field.value
                                ? typeof field.value === 'string'
                                  ? [field.value]
                                  : [field.value as File]
                                : []
                            }
                            mimeType={id ? (singleHospital?.image?.extension as ImageMimeType) : undefined}
                            setFiles={(images: any) => field.onChange(images[0])}
                            type='image'
                            error={!!errors.image}
                          />
                        )}
                      />

                      {errors.image && <FormHelperText error>{errors.image?.message}</FormHelperText>}
                    </Grid>
                    <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
                      <FormLabel>{keywordsTranslate.thumbnail}</FormLabel>
                      <Controller
                        name='thumbnail'
                        control={control}
                        render={({ field }) => (
                          <DropZone
                            files={
                              field.value
                                ? typeof field.value === 'string'
                                  ? [field.value]
                                  : [field.value as File]
                                : []
                            }
                            mimeType={id ? (singleHospital?.thumbnail?.extension as ImageMimeType) : undefined}
                            setFiles={(images: any) => field.onChange(images[0])}
                            type='image'
                            error={!!errors.thumbnail}
                          />
                        )}
                      />

                      {errors.thumbnail && <FormHelperText error>{errors.thumbnail?.message}</FormHelperText>}
                    </Grid>
                    <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
                      <FormLabel>{keywordsTranslate.main_thumbnail}</FormLabel>
                      <Controller
                        name='main_thumbnail'
                        control={control}
                        render={({ field }) => (
                          <DropZone
                            files={
                              field.value
                                ? typeof field.value === 'string'
                                  ? [field.value]
                                  : [field.value as File]
                                : []
                            }
                            mimeType={id ? (singleHospital?.main_thumbnail?.extension as ImageMimeType) : undefined}
                            setFiles={(images: any) => field.onChange(images[0])}
                            type='image'
                            error={!!errors.main_thumbnail}
                          />
                        )}
                      />

                      {errors.main_thumbnail && <FormHelperText error>{errors.main_thumbnail?.message}</FormHelperText>}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  )
})

export default HospitalForm
