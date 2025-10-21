'use client'

// React Imports
import { useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import {
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  LinearProgress,
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
import { setFormErrors } from '@/utils/setFormErrors'
import { menuUrls } from '@/@menu/utils/menuUrls'
import TextField from '@/@core/components/textField'
import TaxonomyAutocomplete from '@/@core/components/taxonomyAutocomplete'
import SEOComponent from '@/@core/components/seoComponent'

const ExpertiseForm = ({ dictionary, id }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; id?: number }) => {
  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary.keywords

  const expertisesTranslate = dictionary.expertise

  const inputTranslate = dictionary.input

  type FormData = z.infer<typeof schema>

  // Schema

  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    taxonomy_id: z.union(
      [
        z.object(
          {
            label: z.string().optional(),
            value: z.number().optional()
          },
          {
            required_error: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}`
          }
        ),
        z.null()
      ],
      {
        required_error: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}`
      }
    )
  })

  // Hooks

  const { data: singleExpertiseData, isLoading: isLoadingSingleExpertise } = useFetch().useQuery(
    'get',
    '/terms/{id}',
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

  const singleExpertise = singleExpertiseData?.data

  useEffect(() => {
    if (singleExpertise) {
      setValue('title', singleExpertise.title ?? '')
      if (singleExpertise.taxonomy)
        setValue('taxonomy_id', { label: singleExpertise.taxonomy?.title, value: singleExpertise.taxonomy?.id })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleExpertise])

  const { mutateAsync: addExpertise, isPending: isAddingExpertise } = useFetch().useMutation('post', '/terms')

  const { mutateAsync: editExpertise, isPending: isEditingExpertise } = useFetch().useMutation('put', '/terms/{id}')

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
    if (!id) {
      await addExpertise({
        body: {
          taxonomy_id: data.taxonomy_id?.value ?? 0,
          title: data.title
        }
      })
        .then(res => {
          toast.success((dictionary as any).messages.expertise_created_successfully)
          router.push(menuUrls.expertises.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editExpertise({
        body: {
          title: data.title,
          taxonomy_id: data.taxonomy_id?.value ?? 0,
          is_main: true,
          is_filter: true,
          is_footer: true
        },
        params: {
          path: {
            id: id ?? 0
          }
        }
      })
        .then(res => {
          toast.success((dictionary as any).messages.expertise_updated_successfully)
          router.push(menuUrls.expertises.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isLoadingSingleExpertise) {
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
                    {id ? expertisesTranslate.editExpertiseTitle : expertisesTranslate.addNewExpertiseTitle}
                  </Typography>
                </div>
                <div className='flex flex-wrap max-sm:flex-col gap-4'>
                  <LoadingButton variant='contained' type='submit' loading={isAddingExpertise || isEditingExpertise}>
                    {keywordsTranslate.save}
                  </LoadingButton>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} lg={12}>
              <Card>
                <CardContent>
                  <Grid container spacing={5}>
                    <Grid item xs={12} md={6}>
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

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='taxonomy_id'
                          control={control}
                          render={({ field }) => {
                            return (
                              <TaxonomyAutocomplete
                                {...field}
                                {...(errors.taxonomy_id && { error: true, helperText: errors.taxonomy_id.message })}
                                label={`${keywordsTranslate.type}`}
                                value={field.value ?? null}
                                onChange={value => field.onChange(value)}
                              />
                            )
                          }}
                        />
                        {errors.taxonomy_id && <FormHelperText error>{errors.taxonomy_id?.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>

        {/* SEO Component - Show only when editing expertise terms (OUTSIDE main form) */}
        {id && singleExpertise?.taxonomy?.key === 'expertise' && (
          <Grid item xs={12} lg={12} sx={{ mt: 6 }}>
            <SEOComponent
              seoableType='term'
              seoableId={id}
              dictionary={dictionary}
            />
          </Grid>
        )}
      </Grid>
    </Grid>
  )
}

export default ExpertiseForm
