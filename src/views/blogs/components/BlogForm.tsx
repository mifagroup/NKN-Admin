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

const BlogForm = ({
  dictionary,
  id,
  type
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  id?: string
  type: string
}) => {
  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary.keywords

  const blogsTranslate = dictionary.blogs

  const validationErrors = dictionary.unique_validation_errors

  const inputTranslate = dictionary.input

  const editorTranslate = dictionary.editor

  type FormData = z.infer<typeof schema>

  // Schema

  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    sub_title: z.string({ required_error: `${keywordsTranslate.sub_title} ${keywordsTranslate.isRequired}` }),
    description: z.string().optional(),
    duration: z.string().optional(),
    main_image: z.union([
      z.string({ required_error: `${keywordsTranslate.image} ${keywordsTranslate.isRequired}` }),
      z.instanceof(File, { message: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` })
    ]),
    gallery: z.array(z.union([z.string(), z.instanceof(File)])).optional(),
    published: z.string(),
    slug: z.string().optional()
  })

  // Functions
  const getListUrlByType = (contentType: string) => {
    switch (contentType) {
      case 'news':
        return menuUrls.news.list
      case 'social_responsibility':
        return menuUrls.social_responsibility.list
      case 'blog':
      default:
        return menuUrls.blogs.list
    }
  }

  // Hooks

  const statuses = useStatuses()

  const { data: singleBlogData, isLoading: isLoadingSingleBlog } = useFetch().useQuery(
    'get',
    '/blogs/{slug}',
    {
      params: {
        path: {
          slug: id ?? ''
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleBlog = singleBlogData?.data as any
  useEffect(() => {
    if (singleBlog) {
      setValue('title', singleBlog.title ?? '')
      setValue('sub_title', singleBlog.sub_title ?? '')
      setValue('description', singleBlog.description ?? '')
      setValue('duration', singleBlog.duration ?? '')

      setValue('published', singleBlog.published_at ? '1' : '0')
      setValue('main_image', singleBlog.main_image?.original_url ?? '')
      // Handle gallery images - check if it's an array of objects with original_url or direct URLs
      const galleryImages = singleBlog.gallery ?
        singleBlog.gallery.map((img: any) => {
          // If it's an object with original_url property, use that
          if (typeof img === 'object' && img.original_url) {
            return img.original_url
          }
          // If it's already a string URL, use it directly
          return img
        }) : []
      setValue('gallery', galleryImages)
      setValue('slug', singleBlog.slug ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleBlog])

  const { mutateAsync: addBlog, isPending: isAddingBlog } = useFetch().useMutation('post', '/blogs')

  const { mutateAsync: editBlog, isPending: isEditingBlog } = useFetch().useMutation('put', '/blogs/{slug}')

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      published: '',
      description: '',
      gallery: []
    }
  })

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const formData = new FormData()

    formData.append('title', data.title)
    formData.append('sub_title', data.sub_title)
    formData.append('description', data.description ?? '')
    formData.append('published', data.published)
    formData.append('slug', data.slug ?? '')
    formData.append('duration', data.duration ?? '')
    formData.append('type', type)

    if (data.main_image && data.main_image instanceof File) {
      formData.append('main_image', data.main_image)
    }

    // Handle gallery images
    if (data.gallery && data.gallery.length > 0) {
      data.gallery.forEach((image, index) => {
        if (image instanceof File) {
          formData.append(`gallery[${index}]`, image)
        }
      })
    }

    const redirectUrl = getListUrlByType(type)

    if (!id) {
      await addBlog({
        body: formData as any
      })
        .then(res => {
          toast.success((dictionary as any).messages.blog_created_successfully)
          router.push(redirectUrl)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editBlog({
        body: formData as any,
        params: {
          path: {
            slug: id ?? 0
          }
        }
      })
        .then(res => {
          toast.success((dictionary as any).messages.blog_updated_successfully)
          router.push(redirectUrl)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isLoadingSingleBlog) {
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
                    {id ? blogsTranslate.editBlogTitle : blogsTranslate.addNewBlogTitle}
                  </Typography>
                </div>
                <div className='flex flex-wrap max-sm:flex-col gap-4'>
                  <LoadingButton variant='contained' type='submit' loading={isAddingBlog || isEditingBlog}>
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
                    <Grid item xs={12} md={6}>
                      <Controller
                        name='duration'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            type='number'
                            placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.duration)}
                            label={keywordsTranslate.duration}
                            onChange={event => {
                              field.onChange(event.target.value)
                            }}
                            {...(errors.duration && { error: true, helperText: errors.duration.message })}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
                      <InputLabel>{keywordsTranslate.description}</InputLabel>
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
                              id ? (singleBlog?.main_image?.extension as ImageMimeType | VideoMimeType) : undefined
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
              {type === 'social_responsibility' && (
                <Card>
                  <CardContent>
                    <Grid container spacing={5}>
                      <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
                        <FormLabel>{keywordsTranslate.gallery}</FormLabel>
                        <Controller
                          name='gallery'
                          control={control}
                          render={({ field }) => (
                            <DropZone
                              files={(field.value || []) as any}
                              setFiles={(images: any) => field.onChange(images)}
                              type='image'
                              multiple={true}
                              error={!!errors.gallery}
                            />
                          )}
                        />
                        {errors.gallery && <FormHelperText error>{errors.gallery?.message}</FormHelperText>}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
              {id && (
                <Card>
                  <CardContent>
                    <Grid display={'flex'} flexDirection={'column'} rowGap={4}>
                      <Typography>{keywordsTranslate.seo}</Typography>
                      <Grid container spacing={5}>
                        <Grid item xs={12}>
                          <Controller
                            name='slug'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                disabled
                                type='text'
                                placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.slug)}
                                label={keywordsTranslate.slug}
                                {...(errors.slug && { error: true, helperText: errors.slug.message })}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  )
}

export default BlogForm
