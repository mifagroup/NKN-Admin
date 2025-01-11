'use client'

// React Imports
import { useEffect, useRef } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// Third-party Imports
import {
  Card,
  CardContent,
  Chip,
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
import AutoComplete, { type IAutocompleteRef } from '@/@core/components/autoComplete/AutoComplete'
import DropZone from '@/@core/components/dropzone/DropZone'
import { formatArrayToString } from '@/utils/formatArrayToString'
import { setFormErrors } from '@/utils/setFormErrors'
import { formatStringToArray } from '@/utils/formatStringToArray'
import { menuUrls } from '@/@menu/utils/menuUrls'
import { slugSchema } from '@/schemas/slugSchema'
import TextField from '@/@core/components/textField'
import type { ImageMimeType, VideoMimeType } from '@/@core/types'

const BrandForm = ({ dictionary, id }: { dictionary: Awaited<ReturnType<typeof getDictionary>>; id?: number }) => {
  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary.keywords

  const validationErrors = dictionary.unique_validation_errors

  const inputTranslate = dictionary.input

  const brandTranslate = dictionary.product_management.brands

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    description: z.string().optional(),
    image: z.union([z.string().optional(), z.instanceof(File).optional()]),
    published: z.string(),
    ordering: z.string(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional(),
    slug: slugSchema(
      validationErrors.slugStartWithHyphen,
      validationErrors.slugContainConsecutiveHyphens,
      validationErrors.lowercaseNumberHyphenLengthError,
      validationErrors.slugEndWithHyphen,
      !!id
    )
  })

  // Hooks

  const keywordsRef = useRef<IAutocompleteRef>(null)

  const statuses = useStatuses()

  const { data: singleBrandData, isLoading: isLoadingSingleBrand } = useFetch().useQuery(
    'get',
    '/brand/{brand}',
    {
      params: {
        path: {
          brand: id ?? 0
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleBrand = singleBrandData?.data

  useEffect(() => {
    if (singleBrand) {
      setValue('title', singleBrand.title ?? '')
      setValue('description', singleBrand.description ?? '')
      setValue('published', singleBrand.published?.value ? '1' : '0')
      setValue('ordering', singleBrand.ordering?.toString() ?? '')
      setValue('seo_title', singleBrand.seo_title ?? '')
      setValue('seo_description', singleBrand.seo_description ?? '')
      setValue('seo_keywords', singleBrand.seo_keywords ?? '')
      setValue('image', singleBrand.image?.original_url ?? '')
      setValue('slug', singleBrand.slug ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleBrand])

  const { mutateAsync: addBrand, isPending: isAddingBrand } = useFetch().useMutation('post', '/brand')

  const { mutateAsync: editBrand, isPending: isEditingBrand } = useFetch().useMutation('put', '/brand/{brand}')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ordering: '1',
      published: '1',
      seo_title: '',
      description: '',
      seo_description: '',
      seo_keywords: ''
    }
  })

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const formData = new FormData()

    formData.append('title', data.title)
    formData.append('description', data.description ?? '')
    formData.append('ordering', data.ordering)
    formData.append('published', String(data.published))
    formData.append('seo_title', data.seo_title ?? '')
    formData.append('seo_description', data.seo_description ?? '')
    formData.append('seo_keywords', data.seo_keywords ?? '')
    formData.append('slug', data.slug ?? '')

    if (data.image && data.image instanceof File) {
      formData.append('image', data.image)
    }

    if (!id) {
      await addBrand({
        body: formData as any
      })
        .then(res => {
          toast.success(res.message)
          router.push(menuUrls.product_management.brand.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editBrand({
        body: formData as any,
        params: {
          path: {
            brand: id
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          router.push(menuUrls.product_management.brand.list)
        })
        .catch(e => {
          console.log(e)
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isLoadingSingleBrand) {
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
                    {id ? brandTranslate.editBrandTitle : brandTranslate.addNewBrandTitle}
                  </Typography>
                </div>
                <div className='flex flex-wrap max-sm:flex-col gap-4'>
                  <LoadingButton variant='contained' type='submit' loading={isAddingBrand || isEditingBrand}>
                    {keywordsTranslate.save}
                  </LoadingButton>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Grid container spacing={5}>
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
                            onChange={event => {
                              field.onChange(event.target.value)
                              setValue('seo_title', event.target.value)
                            }}
                            {...(errors.title && { error: true, helperText: errors.title.message })}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                      <Controller
                        name='ordering'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='number'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.ordering)}
                            label={keywordsTranslate.ordering}
                            {...(errors.ordering && { error: true, helperText: errors.ordering.message })}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6} lg={4}>
                      <FormControl fullWidth error={!!errors.published}>
                        <InputLabel>{keywordsTranslate.status}</InputLabel>
                        <Controller
                          name='published'
                          control={control}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select label={keywordsTranslate.status} {...field}>
                              {statuses?.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                  {type.label}
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                        />
                        {errors.published && <FormHelperText error>{errors.published?.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <Controller
                        name='description'
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            rows={3}
                            type='text'
                            multiline
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.description)}
                            label={keywordsTranslate.description}
                            onChange={event => {
                              field.onChange(event.target.value)
                              setValue('seo_description', event.target.value)
                            }}
                            {...(errors.description && { error: true, helperText: errors.description.message })}
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
                  <Grid xs={12} display={'flex'} flexDirection={'column'} rowGap={4}>
                    <FormLabel>{keywordsTranslate.image}</FormLabel>
                    <Controller
                      name='image'
                      control={control}
                      render={({ field }) => (
                        <DropZone
                          files={
                            field.value ? (typeof field.value === 'string' ? [field.value] : [field.value as File]) : []
                          }
                          mimeType={id ? (singleBrand?.image?.mime_type as ImageMimeType | VideoMimeType) : undefined}
                          setFiles={(images: any) => field.onChange(images[0])}
                          type='image'
                        />
                      )}
                    />
                    {errors.image && <FormHelperText error>{errors.image?.message}</FormHelperText>}
                  </Grid>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Grid display={'flex'} flexDirection={'column'} rowGap={4}>
                    <Typography>{keywordsTranslate.seo}</Typography>
                    <Grid container spacing={5}>
                      {id && (
                        <Grid item xs={12}>
                          <Controller
                            name='slug'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                type='text'
                                placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.slug)}
                                label={keywordsTranslate.slug}
                                {...(errors.slug && { error: true, helperText: errors.slug.message })}
                              />
                            )}
                          />
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Controller
                          name='seo_title'
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              type='text'
                              placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.title)}
                              label={keywordsTranslate.title}
                              {...(errors?.seo_title && { error: true, helperText: errors?.seo_title?.message })}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name='seo_description'
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              multiline
                              rows={3}
                              type='text'
                              placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.description)}
                              label={keywordsTranslate.description}
                              {...(errors?.seo_description && {
                                error: true,
                                helperText: errors?.seo_description?.message
                              })}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <Controller
                            name='seo_keywords'
                            control={control}
                            render={({ field }) => {
                              return (
                                <AutoComplete
                                  {...field}
                                  open={false}
                                  freeSolo={true}
                                  value={field.value ? formatStringToArray(field.value) : []}
                                  onChange={(_, data) => field.onChange(formatArrayToString(data as string[]))}
                                  ref={keywordsRef}
                                  options={[]}
                                  label={`${keywordsTranslate.keywords}`}
                                  placeholder={translateReplacer(
                                    inputTranslate.placeholder,
                                    keywordsTranslate.keywords
                                  )}
                                  multiple
                                  renderTags={(value: any, getTagProps) => {
                                    return value?.map((option: string, index: number) => {
                                      const { key, ...tagProps } = getTagProps({ index })

                                      return <Chip variant='outlined' label={option} key={key} {...tagProps} />
                                    })
                                  }}
                                />
                              )
                            }}
                          />
                          {errors.seo_keywords && <FormHelperText error>{errors.seo_keywords?.message}</FormHelperText>}
                        </FormControl>
                      </Grid>
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

export default BrandForm
