'use client'

// React Imports
import { forwardRef, useEffect } from 'react'

// Third-party Imports
import { Box, FormControl, FormHelperText, InputLabel, LinearProgress, MenuItem, Select } from '@mui/material'
import { type SubmitHandler, Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

// Type Imports
import LoadingButton from '@mui/lab/LoadingButton'
import { toast } from 'react-toastify'

// Hook Imports
import { useQueryClient } from '@tanstack/react-query'

import { useFetch } from '@/utils/clientRequest'
import { translateReplacer } from '@/utils/translateReplacer'

// Component Imports
import { type components } from '@/@core/api/v1'
import type { getDictionary } from '@/utils/getDictionary'
import FormDrawer, { type DrawerHandle } from '@/@core/components/drawers/FormDrawer'
import { useStatuses } from '@/@core/hooks/useStatuses'
import { setFormErrors } from '@/utils/setFormErrors'
import TextField from '@/@core/components/textField'

interface CommentFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  selectedItem?: { id: number | undefined; status: 'editing' | 'deleting' | 'toggling' | 'replying' }
  listQueryParams: Partial<components['parameters']>
}

const CommentForm = forwardRef<DrawerHandle, CommentFormProps>(({ dictionary, selectedItem, listQueryParams }, ref) => {
  // Vars
  const keywordsTranslate = dictionary?.keywords

  const inputTranslate = dictionary?.input

  type FormData = z.infer<typeof schema>

  // Schema
  const schema = z.object({
    comment: z.string({ required_error: `${keywordsTranslate.title} ${keywordsTranslate.isRequired}` }),
    published: z.string()
  })

  // Hooks
  const queryClient = useQueryClient()

  const statuses = useStatuses()

  const { data: singleCommentData, isFetching } = useFetch().useQuery(
    'get',
    '/comment/{comment}',
    {
      params: {
        path: {
          comment: selectedItem?.id ?? 0
        }
      }
    },
    {
      enabled: !!selectedItem?.id
    }
  )

  const singleComment = singleCommentData?.data

  useEffect(() => {
    if (!isFetching && selectedItem?.status === 'editing') {
      handleOpenDrawer()
      setValue('comment', singleComment?.comment ?? '')
      setValue('published', singleComment?.published?.value ? '1' : '0')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching, selectedItem?.status, selectedItem?.id])

  const { mutateAsync: editComment, isPending: isEditingComment } = useFetch().useMutation('put', '/comment/{comment}')

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
      published: '1'
    }
  })

  // Functions
  const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
    if (!selectedItem?.id) {
    } else {
      await editComment({
        body: {
          comment: data.comment,
          published: data.published === '1' ? 1 : 0
        },
        params: {
          path: {
            comment: selectedItem?.id ?? 0
          }
        }
      })
        .then(res => {
          toast.success(res.message)
          handleCloseDrawer()
          queryClient.invalidateQueries({
            queryKey: [
              'get',
              '/comment',
              {
                params: {
                  query: listQueryParams
                }
              }
            ]
          })

          if (!selectedItem?.id) {
            reset()
          }
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }
  }

  const handleCloseDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.close()

  const handleOpenDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.open()

  if (selectedItem?.id && isFetching) {
    return <LinearProgress />
  }

  return (
    <FormDrawer title={`${keywordsTranslate.edit} ${keywordsTranslate.comment}`} ref={ref}>
      <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-y-6 p-5'>
          <Controller
            name='comment'
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
              return (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  autoFocus
                  type='text'
                  placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.comment)}
                  label={keywordsTranslate.comment}
                  {...(errors.comment && { error: true, helperText: errors.comment.message })}
                />
              )
            }}
          />

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
        </div>
        <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'} paddingX={5}>
          <LoadingButton variant='outlined' color='error' onClick={handleCloseDrawer}>
            {keywordsTranslate?.cancel}
          </LoadingButton>
          <LoadingButton variant='contained' type='submit' loading={isEditingComment}>
            {keywordsTranslate?.save}
          </LoadingButton>
        </Box>
      </form>
    </FormDrawer>
  )
})

export default CommentForm
