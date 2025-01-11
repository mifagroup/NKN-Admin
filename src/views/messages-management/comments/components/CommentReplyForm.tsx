'use client'

// React Imports
import { forwardRef } from 'react'

// Third-party Imports
import { Box } from '@mui/material'
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
import { setFormErrors } from '@/utils/setFormErrors'
import TextField from '@/@core/components/textField'

interface CommentReplyFormProps {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  selectedItem?: { id: number | undefined; status: 'editing' | 'deleting' | 'toggling' | 'replying' }
  listQueryParams: Partial<components['parameters']>
}

const CommentReplyForm = forwardRef<DrawerHandle, CommentReplyFormProps>(
  ({ dictionary, selectedItem, listQueryParams }, ref) => {
    // Vars
    const keywordsTranslate = dictionary?.keywords

    const inputTranslate = dictionary?.input

    type FormData = z.infer<typeof schema>

    // Schema
    const schema = z.object({
      reply: z.string({ required_error: `${keywordsTranslate.reply} ${keywordsTranslate.isRequired}` })
    })

    // Hooks
    const queryClient = useQueryClient()

    const { mutateAsync: replyComment, isPending: isReplyingComment } = useFetch().useMutation(
      'post',
      '/comment/{comment}/reply-by-admin'
    )

    const {
      control,
      handleSubmit,
      formState: { errors },
      setError,
      setValue,
      reset
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {}
    })

    // Functions
    const onSubmit: SubmitHandler<FormData> = async (data: FormData) => {
      if (selectedItem?.id) {
        await replyComment({
          body: {
            reply: data.reply
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

            reset()
          })
          .catch(e => {
            setFormErrors(e, setError)
          })
      }
    }

    const handleCloseDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.close()

    const handleOpenDrawer = () => (ref as React.MutableRefObject<DrawerHandle | null>)?.current?.open()

    return (
      <FormDrawer title={`${keywordsTranslate.reply} ${keywordsTranslate.comment}`} ref={ref}>
        <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-col gap-y-6 p-5'>
            <Controller
              name='reply'
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
                    placeholder={translateReplacer(inputTranslate.placeholder, keywordsTranslate.reply)}
                    label={keywordsTranslate.reply}
                    {...(errors.reply && { error: true, helperText: errors.reply.message })}
                  />
                )
              }}
            />
          </div>
          <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'} paddingX={5}>
            <LoadingButton variant='outlined' color='error' onClick={handleCloseDrawer}>
              {keywordsTranslate?.cancel}
            </LoadingButton>
            <LoadingButton variant='contained' type='submit' loading={isReplyingComment}>
              {keywordsTranslate?.save}
            </LoadingButton>
          </Box>
        </form>
      </FormDrawer>
    )
  }
)

export default CommentReplyForm
