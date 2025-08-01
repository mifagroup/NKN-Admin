'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  FormLabel,
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
import type { getDictionary } from '@/utils/getDictionary'
import DropZone from '@/@core/components/dropzone/DropZone'
import TextEditor from '@/@core/components/textEditor/TextEditor'
import { setFormErrors } from '@/utils/setFormErrors'
import { menuUrls } from '@/@menu/utils/menuUrls'
import TextField from '@/@core/components/textField'
import type { ImageMimeType, VideoMimeType } from '@/@core/types'
import { useGenders } from '@/@core/hooks/useGender'
import HospitalAuthcomplete from '@/@core/components/hospitalAuthcomplete'
import ExpertiseAutocomplete from '@/@core/components/termsAutocomplete'

const DoctorForm = ({ dictionary, id }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; id?: number }) => {
  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary.keywords

  const doctorsTranslate = dictionary.doctors

  const messagesTranslate = (dictionary as any).messages

  const formsTranslate = (dictionary as any).forms

  const validationErrors = dictionary.unique_validation_errors

  const inputTranslate = dictionary.input

  const editorTranslate = dictionary.editor

  type FormData = z.infer<typeof schema>

  // Schema

  const schema = z.object({
    first_name: z.string({ required_error: `${keywordsTranslate.first_name} ${keywordsTranslate.isRequired}` }),
    last_name: z.string({ required_error: `${keywordsTranslate.last_name} ${keywordsTranslate.isRequired}` }),
    code: z.string({ required_error: `${keywordsTranslate.code} ${keywordsTranslate.isRequired}` }),
    sub_title: z.string({ required_error: `${keywordsTranslate.sub_title} ${keywordsTranslate.isRequired}` }),
    short_description: z.string({
      required_error: `${keywordsTranslate.short_description} ${keywordsTranslate.isRequired}`
    }),
    redirect: z
      .string({ required_error: `${keywordsTranslate.redirect_url} ${keywordsTranslate.isRequired}` })
      .url({ message: validationErrors.valid_link }),
    description: z.string({
      required_error: `${keywordsTranslate.description} ${keywordsTranslate.isRequired}`
    }),
    gender: z.string({
      required_error: `${keywordsTranslate.gender} ${keywordsTranslate.isRequired}`
    }),
    hospital_id: z.union(
      [
        z
          .object({
            label: z.string().optional(),
            value: z.number().optional()
          })
          .optional(),
        z.null()
      ],
      {
        required_error: `${keywordsTranslate.hospital} ${keywordsTranslate.isRequired}`
      }
    ),
    main_image: z.union([
      z.string({ required_error: `${keywordsTranslate.image} ${keywordsTranslate.isRequired}` }),
      z.instanceof(File, { message: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` })
    ]),
    terms: z.array(
      z.object({
        label: z.string().optional(),
        value: z.number().optional()
      }),
      { required_error: `${keywordsTranslate.expertises} ${keywordsTranslate.isRequired}` }
    )
  })

  // Hooks

  const genders = useGenders()

  const { data: singleDoctorData, isLoading: isLoadingSingleDoctorData } = useFetch().useQuery(
    'get',
    '/doctors/{id}',
    {
      params: {
        path: {
          id: id ?? ''
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleDoctor = singleDoctorData?.data

  useEffect(() => {
    if (singleDoctor) {
      setValue('first_name', singleDoctor.first_name ?? '')
      setValue('last_name', singleDoctor.last_name ?? '')
      setValue('gender', singleDoctor.gender === 'male' ? 'male' : 'female')
      setValue('code', singleDoctor.code ?? '')
      setValue('sub_title', singleDoctor.sub_title ?? '')
      setValue('short_description', singleDoctor.short_description ?? '')
      setValue('redirect', singleDoctor.redirect ?? '')
      setValue('description', singleDoctor.description ?? '')
      if (singleDoctor.hospital)
        setValue('hospital_id', { label: singleDoctor.hospital?.name, value: singleDoctor.hospital?.id })
      if (singleDoctor.terms?.length)
        setValue('terms', singleDoctor.terms?.map(term => ({ label: term.title, value: term.id })) ?? [])
      setValue('main_image', singleDoctor.image?.original_url ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleDoctor])

  const { mutateAsync: addDoctor, isPending: isAddingDoctor } = useFetch().useMutation('post', '/doctors')

  const { mutateAsync: editDoctor, isPending: isEditingDoctor } = useFetch().useMutation('put', '/doctors/{id}')

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

    formData.append('first_name', data.first_name)
    formData.append('last_name', data.last_name)
    formData.append('code', data.code)
    formData.append('sub_title', data.sub_title)
    formData.append('short_description', data.short_description)
    formData.append('redirect', data.redirect)
    formData.append('description', data.description)
    formData.append('gender', data.gender)
    formData.append('hospital_id', data.hospital_id?.value?.toString() ?? '')

    if (data?.terms?.length) {
      for (let i = 0; i < data?.terms?.length; i++) {
        formData.append('terms[]', String(data.terms?.[i].value))
      }
    }

    if (data.main_image && data.main_image instanceof File) {
      formData.append('main_image', data.main_image)
    }

    if (!id) {
      await addDoctor({
        body: formData as any
      })
        .then(res => {
          toast.success(messagesTranslate.doctor_created_successfully)
          router.push(menuUrls.doctors.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editDoctor({
        body: formData as any,
        params: {
          path: {
            id: id ?? 0
          }
        }
      })
        .then(res => {
          toast.success(messagesTranslate.doctor_updated_successfully)
          router.push(menuUrls.doctors.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isLoadingSingleDoctorData) {
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
                    {id ? doctorsTranslate.editDoctorTitle : doctorsTranslate.addNewDoctorTitle}
                  </Typography>
                </div>
                <div className='flex flex-wrap max-sm:flex-col gap-4'>
                  <LoadingButton variant='contained' type='submit' loading={isAddingDoctor || isEditingDoctor}>
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
                        name='first_name'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            autoFocus
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.first_name)}
                            label={keywordsTranslate.first_name}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.first_name && { error: true, helperText: errors.first_name.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='last_name'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.last_name)}
                            label={keywordsTranslate.last_name}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.last_name && { error: true, helperText: errors.last_name.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='code'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.code)}
                            label={keywordsTranslate.code}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.code && { error: true, helperText: errors.code.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='redirect'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.redirect_url)}
                            label={keywordsTranslate.redirect_url}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.redirect && { error: true, helperText: errors.redirect.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.gender}>
                        <InputLabel>{keywordsTranslate?.gender}</InputLabel>
                        <Controller
                          name='gender'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => {
                            console.log('field', field)

                            return (
                              <Select
                                label={keywordsTranslate?.gender}
                                {...field}
                                value={field.value || ''}
                                onChange={event => {
                                  field.onChange(event.target.value)
                                }}
                              >
                                {genders?.map(gender => (
                                  <MenuItem key={gender.value} value={gender.value}>
                                    {gender.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            )
                          }}
                        />
                        {errors.gender && <FormHelperText error>{errors.gender?.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='hospital_id'
                          control={control}
                          render={({ field }) => {
                            return (
                              <HospitalAuthcomplete
                                {...field}
                                {...(errors.hospital_id && { error: true, helperText: errors.hospital_id.message })}
                                label={`${keywordsTranslate.hospital}`}
                                value={field.value ?? null}
                                onChange={value => field.onChange(value)}
                              />
                            )
                          }}
                        />
                        {errors.hospital_id && <FormHelperText error>{errors.hospital_id?.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <Controller
                          name='terms'
                          control={control}
                          render={({ field }) => {
                            return (
                              <ExpertiseAutocomplete
                                {...field}
                                {...(errors.terms && { error: true, helperText: errors.terms.message })}
                                label={`${keywordsTranslate.expertises}`}
                                value={field.value ?? []}
                                onChange={value => field.onChange(value)}
                                multiple
                              />
                            )
                          }}
                        />
                        {errors.terms && <FormHelperText error>{errors.terms?.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='sub_title'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='text'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.sub_title)}
                            label={keywordsTranslate.sub_title}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.sub_title && { error: true, helperText: errors.sub_title.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='short_description'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            autoFocus
                            type='text'
                            multiline
                            rows={3}
                            placeholder={translateReplacer(
                              inputTranslate.placeholder,
                              keywordsTranslate.short_description
                            )}
                            label={keywordsTranslate.short_description}
                            {...(errors.short_description && {
                              error: true,
                              helperText: errors.short_description.message
                            })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
                      <InputLabel>{keywordsTranslate.fullDescription}</InputLabel>
                      <Controller
                        name='description'
                        control={control}
                        render={({ field }) => (
                          <TextEditor
                            placeholder={editorTranslate.fullDescriptionPlaceholder}
                            onChange={editor => field.onChange(editor)}
                            value={field.value ?? ''}
                          />
                        )}
                      />
                      {errors.description && <FormHelperText error>{errors.description?.message}</FormHelperText>}
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
                        name='main_image'
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
                            mimeType={
                              id ? (singleDoctor?.image?.extension as ImageMimeType | VideoMimeType) : undefined
                            }
                            setFiles={(images: any) => field.onChange(images[0])}
                            type='image'
                            error={!!errors.main_image}
                          />
                        )}
                      />

                      {errors.main_image && <FormHelperText error>{errors.main_image?.message}</FormHelperText>}
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
}

export default DoctorForm
