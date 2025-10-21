'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Third-party Imports
import {
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  LinearProgress,
  Alert,
  Box
} from '@mui/material'
import { type SubmitHandler, Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import LoadingButton from '@mui/lab/LoadingButton'
import { toast } from 'react-toastify'

// Hook Imports
import { useFetch } from '@/utils/clientRequest'
import { translateReplacer } from '@/utils/translateReplacer'
import { setFormErrors } from '@/utils/setFormErrors'
import { useGetDictionary } from '@/utils/useGetDictionary'

// Component Imports
import TextField from '@/@core/components/textField'

type SEOComponentProps = {
  seoableType: string
  seoableId: number | null | undefined
  dictionary?: any
  onSeoSaved?: (seoData: any) => void
}

const SEOComponent = ({ seoableType, seoableId, dictionary, onSeoSaved }: SEOComponentProps) => {
  // States
  const [existingSeo, setExistingSeo] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  // Hooks
  const { lang: locale } = useParams()
  const defaultDictionary = useGetDictionary()
  const dict = dictionary || defaultDictionary

  // Multi-language support:
  // - UI translations: Uses dict/defaultDictionary based on current locale
  // - API calls: useFetch() automatically sends Accept-Language header with current locale
  const keywordsTranslate = dict?.keywords
  const seoTranslate = dict?.seo || {}

  // Schema
  const schema = z.object({
    title: z
      .string({ required_error: `${keywordsTranslate?.title} ${keywordsTranslate?.isRequired}` })
      .min(1, `${keywordsTranslate?.title} ${keywordsTranslate?.isRequired}`),
    description: z
      .string({ required_error: `${keywordsTranslate?.description} ${keywordsTranslate?.isRequired}` })
      .min(1, `${keywordsTranslate?.description} ${keywordsTranslate?.isRequired}`),
    h1: z
      .string({ required_error: `H1 ${keywordsTranslate?.isRequired}` })
      .min(1, `H1 ${keywordsTranslate?.isRequired}`)
  })

  type FormData = z.infer<typeof schema>

  // API Hooks
  const { data: seoData, isLoading: isLoadingSeo } = useFetch().useQuery(
    'get',
    '/seos/{id}/{type}',
    {
      params: {
        path: {
          id: seoableId ?? '',
          type: seoableType ?? ''
        }
      }
    },
    {
      enabled: !!seoableId && !!seoableType
    }
  )

  const { mutateAsync: createSeo, isPending: isCreatingSeo } = useFetch().useMutation('post', '/seos')

  const { mutateAsync: updateSeo, isPending: isUpdatingSeo } = useFetch().useMutation('put', '/seos/{id}')

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
      h1: ''
    }
  })

  // Effects
  useEffect(() => {
    if (seoData?.data) {
      // Handle both single object and array responses
      const seo = Array.isArray(seoData.data) ? seoData.data[0] : seoData.data

      if (seo && (seo.id || seo.title || seo.description || seo.h1)) {
        setExistingSeo(seo)
        setValue('title', seo.title ?? '')
        setValue('description', seo.description ?? '')
        setValue('h1', seo.h1 ?? '')
      } else {
        setExistingSeo(null)
        reset()
      }
    } else if (seoData?.data === null || (Array.isArray(seoData?.data) && seoData.data.length === 0)) {
      setExistingSeo(null)
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seoData, setValue, reset])

  // Handlers
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    try {
      if (existingSeo?.id) {
        // Update existing SEO
        await updateSeo({
          body: {
            title: data.title,
            description: data.description,
            h1: data.h1
          },
          params: {
            path: {
              id: existingSeo.id
            }
          }
        })
          .then(res => {
            toast.success(seoTranslate.updated_successfully || 'SEO updated successfully')
            setExistingSeo(res.data)
            onSeoSaved?.(res.data)
          })
          .catch(e => {
            setFormErrors(e, setError)
          })
      } else {
        // Create new SEO
        if (!seoableId) {
          toast.error('Item must be saved before adding SEO data')
          return
        }

        await createSeo({
          body: {
            title: data.title,
            description: data.description,
            h1: data.h1,
            seoable_type: seoableType,
            seoable_id: seoableId
          }
        })
          .then(res => {
            toast.success(seoTranslate.created_successfully || 'SEO created successfully')
            setExistingSeo(res.data)
            onSeoSaved?.(res.data)
          })
          .catch(e => {
            setFormErrors(e, setError)
          })
      }
    } catch (error) {
      console.error('SEO save error:', error)
    }
  }

  // Don't show component if no seoableId (item not saved yet)
  if (!seoableId) {
    return (
      <Alert severity='info'>
        {seoTranslate.save_item_first || 'Save the item first before adding SEO data'}
      </Alert>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <Typography variant='h5'>
                {seoTranslate.seo_title || 'SEO Settings'}
              </Typography>
            }
            subheader={seoTranslate.seo_description || 'Manage search engine optimization data'}
          />
          <Divider />

          {isLoadingSeo && <LinearProgress />}

          <CardContent>
            <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={5}>
                {/* Title Field */}
                <Grid item xs={12}>
                  <Controller
                    name='title'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='text'
                        placeholder={translateReplacer(
                          dict?.input?.placeholder,
                          `${keywordsTranslate?.seo || 'SEO'} ${keywordsTranslate?.title}`
                        )}
                        label={`${keywordsTranslate?.seo || 'SEO'} ${keywordsTranslate?.title}`}
                        onChange={event => {
                          field.onChange(event.target.value)
                        }}
                        helperText={
                          errors.title?.message ||
                          `${seoTranslate.title_help_text || 'Used in search results and browser tabs'}`
                        }
                        {...(errors.title && { error: true })}
                      />
                    )}
                  />
                </Grid>

                {/* Description Field */}
                <Grid item xs={12}>
                  <Controller
                    name='description'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        minRows={3}
                        placeholder={translateReplacer(
                          dict?.input?.placeholder,
                          `${keywordsTranslate?.seo || 'SEO'} ${keywordsTranslate?.description}`
                        )}
                        label={`${keywordsTranslate?.seo || 'SEO'} ${keywordsTranslate?.description}`}
                        onChange={event => {
                          field.onChange(event.target.value)
                        }}
                        helperText={
                          errors.description?.message ||
                          `${seoTranslate.description_help_text || 'Displayed under page title in search results (recommended: 120-160 characters)'}`
                        }
                        {...(errors.description && { error: true })}
                      />
                    )}
                  />
                </Grid>

                {/* H1 Field */}
                <Grid item xs={12}>
                  <Controller
                    name='h1'
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type='text'
                        placeholder={translateReplacer(
                          dict?.input?.placeholder,
                          'H1'
                        )}
                        label='H1'
                        onChange={event => {
                          field.onChange(event.target.value)
                        }}
                        helperText={
                          errors.h1?.message ||
                          `${seoTranslate.h1_help_text || 'Main heading on the page'}`
                        }
                        {...(errors.h1 && { error: true })}
                      />
                    )}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <LoadingButton
                      variant='contained'
                      type='submit'
                      loading={isCreatingSeo || isUpdatingSeo || isLoadingSeo}
                      disabled={isLoadingSeo}
                    >
                      {keywordsTranslate?.save || 'Save'}
                    </LoadingButton>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default SEOComponent
