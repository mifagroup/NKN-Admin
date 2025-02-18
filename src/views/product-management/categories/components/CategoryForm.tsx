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
import { useQueryParams } from '@/@core/hooks/useQueryParams'
import DropZone from '@/@core/components/dropzone/DropZone'
import TextEditor from '@/@core/components/textEditor/TextEditor'
import { setFormErrors } from '@/utils/setFormErrors'
import { formatStringToArray } from '@/utils/formatStringToArray'
import { formatArrayToString } from '@/utils/formatArrayToString'
import { menuUrls } from '@/@menu/utils/menuUrls'
import { slugSchema } from '@/schemas/slugSchema'
import CategoryAutoComplete from '@/@core/components/categoryAutocomplete'
import { type components } from '@/@core/api/v1'
import TextField from '@/@core/components/textField'
import type { ImageMimeType, VideoMimeType } from '@/@core/types'

const CategoryForm = ({
  dictionary,
  id,
  type
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  id?: number
  type: components['schemas']['CategoryTypeEnum']['value']
}) => {
  // Vars

  const router = useRouter()

  const keywordsTranslate = dictionary.keywords

  const validationErrors = dictionary.unique_validation_errors

  const inputTranslate = dictionary.input

  const categoryTranslate = dictionary.product_management.categories

  const editorTranslate = dictionary.editor

  type FormData = z.infer<typeof schema>

  // Schema

  const schema = z.object({
    title: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    type: z.string(),
    description: z.string().optional(),
    body: z.string().optional(),
    parent_id: z.union([
      z
        .object({
          label: z.string().optional(),
          value: z.number().optional()
        })
        .optional(),
      z.null()
    ]),
    image: z.union([
      z.string({ required_error: `${keywordsTranslate.image} ${keywordsTranslate.isRequired}` }),
      z.instanceof(File, { message: `${keywordsTranslate.type} ${keywordsTranslate.isRequired}` })
    ]),
    published: z.string(),
    ordering: z.string(),
    tags: z.union([
      z
        .array(
          z.object({
            label: z.string().optional(),
            value: z.union([z.string(), z.number()]).optional()
          })
        )
        .optional(),
      z.null()
    ]),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.string().optional(),
    attribute_group_id: z.union([
      z
        .object({
          label: z.string().optional(),
          value: z.number().optional()
        })
        .optional(),
      z.null()
    ]),
    slug: slugSchema(
      validationErrors.slugStartWithHyphen,
      validationErrors.slugContainConsecutiveHyphens,
      validationErrors.lowercaseNumberHyphenLengthError,
      validationErrors.slugEndWithHyphen,
      !!id
    )
  })

  // Hooks

  const { queryParams: attributeGroupsQueryParams, setQueryParams: setAttributeGroupQueryParams } = useQueryParams()

  const { queryParams: tagsQueryParams, setQueryParams: setTagsQueryParams } = useQueryParams()

  const attributeGroupRef = useRef<IAutocompleteRef>(null)

  const tagsRef = useRef<IAutocompleteRef>(null)

  const keywordsRef = useRef<IAutocompleteRef>(null)

  const statuses = useStatuses()

  const { data: attributeGroupsData, isLoading: isLoadingAttributeGroups } = useFetch().useQuery(
    'get',
    '/select/{model}',
    {
      params: {
        path: {
          model: 'attribute_group'
        },
        query: {
          'filter[search]': attributeGroupsqueryParams?.filter?.search
        }
      }
    }
  )

  const { data: tagsData, isLoading: isLoadingTagsData } = useFetch().useQuery('get', '/select/{model}', {
    params: {
      path: {
        model: 'tag'
      },
      query: {
        'filter[search]': tagsqueryParams?.filter?.search
      }
    }
  })

  const tagsOptions = tagsData?.data?.map(tag => ({ label: tag.label, value: tag.label }))

  const { data: singleCategoryData, isLoading: isLoadingSingleCategory } = useFetch().useQuery(
    'get',
    '/category/{category}',
    {
      params: {
        path: {
          category: id ?? 0
        }
      }
    },
    {
      enabled: !!id
    }
  )

  const singleCategory = singleCategoryData?.data

  useEffect(() => {
    if (singleCategory) {
      setValue('title', singleCategory.title ?? '')

      setValue('description', singleCategory.description ?? '')
      setValue('body', singleCategory.body ?? '')
      if (singleCategory.parent)
        setValue('parent_id', { label: singleCategory.parent?.title, value: singleCategory.parent?.id })
      setValue('published', singleCategory.published?.value ? '1' : '0')
      setValue('ordering', singleCategory.ordering?.toString() ?? '')
      if (singleCategory.tags?.length)
        setValue('tags', singleCategory.tags?.map(tag => ({ label: tag.name, value: tag.id })) ?? [])
      setValue('seo_title', singleCategory.seo_title ?? '')
      setValue('seo_description', singleCategory.seo_description ?? '')
      setValue('seo_keywords', singleCategory.seo_keywords ?? '')
      if (singleCategory.attribute_group)
        setValue('attribute_group_id', {
          label: singleCategory.attribute_group?.title,
          value: singleCategory.attribute_group?.id
        })
      setValue('image', singleCategory.image?.original_url ?? '')
      setValue('slug', singleCategory.slug ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleCategory])

  const { mutateAsync: addCategory, isPending: isAddingCategory } = useFetch().useMutation('post', '/category')

  const { mutateAsync: editCategory, isPending: isEditingCategory } = useFetch().useMutation(
    'put',
    '/category/{category}'
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ordering: '1',
      published: '1',
      description: '',
      body: '',
      seo_title: '',
      seo_description: '',
      seo_keywords: '',
      type: type,
      parent_id: {
        value: 0,
        label: ''
      },
      attribute_group_id: {
        value: 0,
        label: ''
      },
      tags: []
    }
  })

  const attributeGroupIdWatch = watch('attribute_group_id')

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    const formData = new FormData()

    formData.append('title', data.title)
    formData.append('description', data.description ?? '')
    formData.append('body', data.body ?? '')
    formData.append('published', data.published)
    formData.append('ordering', data.ordering)
    formData.append('seo_title', data.seo_title ?? '')
    formData.append('seo_description', data.seo_description ?? '')
    formData.append('seo_keywords', data.seo_keywords ?? '')
    formData.append('type', data.type)
    formData.append('slug', data.slug ?? '')

    if (data.parent_id?.value) {
      formData.append('parent_id', data.parent_id?.value?.toString() ?? '')
    }

    if (data.attribute_group_id?.value) {
      formData.append('attribute_group_id', data.attribute_group_id?.value?.toString() ?? '')
    }

    if (data.image && data.image instanceof File) {
      formData.append('image', data.image)
    }

    data.tags?.forEach(tag => {
      if (tag?.value !== undefined) {
        formData.append('tags[]', tag.label ?? '')
      }
    })

    if (!id) {
      await addCategory({
        body: formData as any
      })
        .then(res => {
          toast.success(res.message)
          router.push(menuUrls.product_management.category.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    } else {
      await editCategory({
        body: formData as any,
        params: {
          path: {
            category: id
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          router.push(menuUrls.product_management.category.list)
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  if (id && isLoadingSingleCategory) {
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
                    {id ? categoryTranslate.editCategoryTitle : categoryTranslate.addNewCategoryTitle}
                  </Typography>
                </div>
                <div className='flex flex-wrap max-sm:flex-col gap-4'>
                  <LoadingButton variant='contained' type='submit' loading={isAddingCategory || isEditingCategory}>
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
                              setValue('seo_title', event.target.value)
                            }}
                            {...(errors.title && { error: true, helperText: errors.title.message })}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='attribute_group_id'
                          control={control}
                          render={({ field }) => {
                            return (
                              <AutoComplete
                                {...field}
                                {...(errors.attribute_group_id && {
                                  error: true,
                                  helperText: errors.attribute_group_id.message
                                })}
                                open={false}
                                value={field.value}
                                onChange={(_, data) => {
                                  field.onChange(data)
                                  setValue('parent_id', {
                                    value: 0,
                                    label: ''
                                  })
                                }}
                                ref={attributeGroupRef}
                                options={attributeGroupsData?.data ?? []}
                                loading={isLoadingAttributeGroups}
                                handleInputChange={value =>
                                  setAttributeGroupQueryParams(prevParams => ({
                                    ...prevParams,
                                    filter: {
                                      ...prevParams.filter,
                                      search: value
                                    }
                                  }))
                                }
                                inputValue={attributeGroupsqueryParams?.filter?.search ?? ''}
                                label={`${keywordsTranslate.attribute_group}`}
                              />
                            )
                          }}
                        />
                        {errors.attribute_group_id && (
                          <FormHelperText error>{errors.attribute_group_id.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='parent_id'
                          control={control}
                          render={({ field }) => {
                            return (
                              <CategoryAutoComplete
                                {...field}
                                {...(errors.parent_id && { error: true, helperText: errors.parent_id.message })}
                                label={`${keywordsTranslate.category} ${keywordsTranslate.parent}`}
                                value={field.value}
                                onChange={value => field.onChange(value)}
                                type='product'
                                disabled={!attributeGroupIdWatch?.value}
                                options={`attribute_group_id=${attributeGroupIdWatch?.value}`}
                              />
                            )
                          }}
                        />
                        {errors.parent_id && <FormHelperText error>{errors.parent_id?.message}</FormHelperText>}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <Controller
                          name='tags'
                          control={control}
                          render={({ field }) => {
                            return (
                              <AutoComplete
                                {...field}
                                {...(errors.tags && { error: true, helperText: errors.tags.message })}
                                multiple
                                open={false}
                                value={field.value}
                                onChange={(_, data) => field.onChange(data)}
                                ref={tagsRef}
                                options={tagsOptions ?? []}
                                loading={isLoadingTagsData}
                                handleInputChange={value =>
                                  setTagsQueryParams(prevParams => ({
                                    ...prevParams,
                                    filter: {
                                      ...prevParams.filter,
                                      search: value
                                    }
                                  }))
                                }
                                inputValue={tagsqueryParams?.filter?.search ?? ''}
                                label={`${keywordsTranslate.tags}`}
                              />
                            )
                          }}
                        />
                        {errors.tags && <FormHelperText error>{errors.tags.message}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
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
                    <Grid item xs={12} display={'flex'} flexDirection={'column'} rowGap={2}>
                      <InputLabel>{keywordsTranslate.fullDescription}</InputLabel>
                      <Controller
                        name='body'
                        control={control}
                        render={({ field }) => (
                          <TextEditor
                            placeholder={editorTranslate.fullDescriptionPlaceholder}
                            onChange={editor => field.onChange(editor.editor.getHTML())}
                            value={field.value ?? ''}
                          />
                        )}
                      />
                      {errors.body && <FormHelperText error>{errors.body?.message}</FormHelperText>}
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
                            mimeType={
                              id ? (singleCategory?.image?.mime_type as ImageMimeType | VideoMimeType) : undefined
                            }
                            setFiles={(images: any) => field.onChange(images[0])}
                            type='image'
                            error={!!errors.image}
                          />
                        )}
                      />

                      {errors.image && <FormHelperText error>{errors.image?.message}</FormHelperText>}
                    </Grid>
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
                                  {...(errors.seo_keywords && { error: true, helperText: errors.seo_keywords.message })}
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

export default CategoryForm
