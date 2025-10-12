'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import { Card, CardContent, Checkbox, FormControlLabel, FormHelperText, FormLabel, Grid, LinearProgress, Typography } from '@mui/material'
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
import { setFormErrors } from '@/utils/setFormErrors'
import TextField from '@/@core/components/textField'
import { menuUrls } from '@/@menu/utils/menuUrls'
import DropZone from '@/@core/components/dropzone/DropZone'
import type { ImageMimeType } from '@/@core/types'
import HospitalAuthcomplete from '@/@core/components/hospitalAuthcomplete'

interface InsuranceFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  id?: number
}

const InsuranceForm = ({ dictionary, id }: InsuranceFormProps) => {
  // Vars
  const router = useRouter()

  const keywordsTranslate = dictionary?.keywords
  const inputTranslate = dictionary?.input
  const insuranceTranslate = (dictionary as any).insurance
  const messagesTranslate = (dictionary as any).messages

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    logo: z.union([
      z.string({ required_error: `${keywordsTranslate.logo} ${keywordsTranslate.isRequired}` }),
      z.instanceof(File, { message: `${keywordsTranslate.logo} ${keywordsTranslate.isRequired}` })
    ]),
    hospitals: z
      .array(
        z.object({
          label: z.string().optional(),
          value: z.number().optional()
        })
      )
      .optional(),
    is_outpatient: z.boolean().optional().nullable(),
    is_inpatient: z.boolean().optional().nullable()
  })

  // Hooks
  const {
    data: singleInsuranceData,
    isLoading: isLoadingInsurance,
    isFetching
  } = useFetch().useQuery(
    'get',
    '/insurances/{id}',
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

  const singleInsurance = singleInsuranceData?.data

  useEffect(() => {
    if (singleInsurance) {
      setValue('title', singleInsurance?.title ?? '')
      setValue('logo', singleInsurance?.logo?.original_url ?? '')
      setValue('is_outpatient', singleInsurance?.is_outpatient ?? false)
      setValue('is_inpatient', singleInsurance?.is_inpatient ?? false)
      if (singleInsurance?.hospitals?.length) {
        setValue(
          'hospitals',
          singleInsurance.hospitals.map((hospital: any) => ({
            label: hospital.name,
            value: hospital.id
          }))
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleInsurance])

  const { mutateAsync: addInsurance, isPending: isAddingInsurance } = useFetch().useMutation('post', '/insurances')

  const { mutateAsync: editInsurance, isPending: isEditingInsurance } = useFetch().useMutation(
    'put',
    '/insurances/{id}'
  )

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

    formData.append('title', data.title)

    if (data.logo && data.logo instanceof File) {
      formData.append('logo', data.logo)
    }

    if (data?.hospitals?.length) {
      for (let i = 0; i < data.hospitals.length; i++) {
        formData.append('hospitals[]', String(data.hospitals[i].value))
      }
    }

    formData.append('is_outpatient', data.is_outpatient ? '1' : '0')
    formData.append('is_inpatient', data.is_inpatient ? '1' : '0')

    if (!id) {
      await addInsurance({
        body: formData as any
      })
        .then(res => {
          toast.success(messagesTranslate.insurance_created_successfully)
          router.push(menuUrls.insurances.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editInsurance({
        body: formData as any,
        params: {
          path: {
            id: id
          }
        }
      })
        .then(res => {
          toast.success(messagesTranslate.insurance_updated_successfully)
          router.push(menuUrls.insurances.list)
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
                    {id ? insuranceTranslate.editInsuranceTitle : insuranceTranslate.addNewInsuranceTitle}
                  </Typography>
                </div>
                <div className='flex flex-wrap max-sm:flex-col gap-4'>
                  <LoadingButton variant='contained' type='submit' loading={isAddingInsurance || isEditingInsurance}>
                    {keywordsTranslate.save}
                  </LoadingButton>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12}>
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
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.title && { error: true, helperText: errors.title.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='hospitals'
                        control={control}
                        render={({ field }) => (
                          <HospitalAuthcomplete
                            error={!!errors.hospitals}
                            label={keywordsTranslate.hospitals}
                            multiple={true}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      {errors.hospitals && <FormHelperText error>{errors.hospitals?.message}</FormHelperText>}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='is_outpatient'
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value ?? false}
                                onChange={e => field.onChange(e.target.checked)}
                              />
                            }
                            label={keywordsTranslate.is_outpatient}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='is_inpatient'
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value ?? false}
                                onChange={e => field.onChange(e.target.checked)}
                              />
                            }
                            label={keywordsTranslate.is_inpatient}
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
                      <FormLabel>{keywordsTranslate.logo}</FormLabel>
                      <Controller
                        name='logo'
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
                            mimeType={id ? (singleInsurance?.logo?.extension as ImageMimeType) : undefined}
                            setFiles={(images: any) => field.onChange(images[0])}
                            type='image'
                            error={!!errors.logo}
                          />
                        )}
                      />

                      {errors.logo && <FormHelperText error>{errors.logo?.message}</FormHelperText>}
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

export default InsuranceForm
