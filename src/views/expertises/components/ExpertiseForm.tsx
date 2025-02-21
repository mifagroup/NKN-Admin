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
import { useStatuses } from '@/@core/hooks/useStatuses'
import { type IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'
import DropZone from '@/@core/components/dropzone/DropZone'
import TextEditor from '@/@core/components/textEditor/TextEditor'
import { setFormErrors } from '@/utils/setFormErrors'
import { menuUrls } from '@/@menu/utils/menuUrls'
import { slugSchema } from '@/schemas/slugSchema'
import TextField from '@/@core/components/textField'
import type { ImageMimeType, VideoMimeType } from '@/@core/types'

const ExpertiseForm = ({ dictionary, id }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; id?: number }) => {
  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary.keywords

  const expertisesTranslate = dictionary.expertise

  const validationErrors = dictionary.unique_validation_errors

  const inputTranslate = dictionary.input

  const editorTranslate = dictionary.editor

  type FormData = z.infer<typeof schema>

  // Schema

  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    taxonomy_id: z.union(
      [
        z
          .object({
            label: z.string().optional(),
            value: z.number().optional()
          })
          .optional(),
        z.null()
      ],
      { required_error: `${keywordsTranslate.taxonomy} ${keywordsTranslate.isRequired}` }
    )
  })

  // Hooks

  const { data: taxonomiesData, isLoading: isLoadingTaxonomies } = useFetch().useQuery('get', '/taxonomies')

  const taxonomies = taxonomiesData?.data

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
        setValue('taxonomy_id', {
          label: singleExpertise.taxonomy?.title,
          value: singleExpertise.taxonomy?.id
        })
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
    console.log(data)

    if (!id) {
      await addExpertise({
        body: {
          taxonomy_id: data.taxonomy_id?.value ?? 0,
          title: data.title
        }
      })
        .then(res => {
          // @ts-ignore
          toast.success(res.message)
          router.push(menuUrls.expertises.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editExpertise({
        body: {
          title: data.title,
          taxonomy_id: data.taxonomy_id?.value ?? 0
        },
        params: {
          path: {
            id: id ?? 0
          }
        }
      })
        .then(res => {
          // @ts-ignore
          toast.success(res.message)
          router.push(menuUrls.expertises.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isLoadingSingleExpertise && isLoadingTaxonomies) {
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
                      <FormControl fullWidth error={!!errors.taxonomy_id}>
                        <InputLabel>{keywordsTranslate.taxonomy}</InputLabel>
                        <Controller
                          name='taxonomy_id'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => {
                            return (
                              <Select
                                label={keywordsTranslate.taxonomy}
                                defaultValue={taxonomies?.find(taxonomy => taxonomy.id === field?.value?.value)?.title}
                                onChange={event => {
                                  field.onChange(event.target.value)
                                }}
                              >
                                {taxonomies?.map(taxonomy => (
                                  <MenuItem key={taxonomy.id} value={taxonomy.id}>
                                    {taxonomy.title}
                                  </MenuItem>
                                ))}
                              </Select>
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
      </Grid>
    </Grid>
  )
}

export default ExpertiseForm
