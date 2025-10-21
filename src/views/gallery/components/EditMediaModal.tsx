'use client'

// React Imports
import { forwardRef, useImperativeHandle, useState, useMemo, useEffect } from 'react'

// Third-party Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'react-toastify'

// Type Imports
import type { components } from '@/@core/api/v1'
import type { getDictionary } from '@/utils/getDictionary'

// Hook Imports
import { useFetch } from '@/utils/clientRequest'
import { setFormErrors } from '@/utils/setFormErrors'

export interface EditMediaModalHandle {
  open: (media: components['schemas']['FileResource']) => void
  close: () => void
}

type EditMediaModalProps = {
  dictionary: Awaited<ReturnType<typeof getDictionary>>
  onSuccess?: () => void
}

const EditMediaModal = forwardRef<EditMediaModalHandle, EditMediaModalProps>(
  ({ dictionary, onSuccess }, ref) => {
    // States
    const [isOpen, setIsOpen] = useState(false)
    const [currentMedia, setCurrentMedia] = useState<components['schemas']['FileResource'] | null>(null)

    // Hooks
    const { mutateAsync: updateMedia, isPending: isUpdating } = useFetch().useMutation('put', '/media/{id}')

    const keywordsTranslate = dictionary.keywords
    const inputTranslate = dictionary.input

    const schema = z.object({
      file_name: z
        .string({ required_error: `${keywordsTranslate?.title} ${keywordsTranslate?.isRequired}` })
        .min(1, `${keywordsTranslate?.title} ${keywordsTranslate?.isRequired}`),
      alt: z
        .string().optional().nullable(),
    })
    type FormData = z.infer<typeof schema>

    const {
      control,
      handleSubmit,
      formState: { errors },
      setError,
      reset,
    } = useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        file_name: '',
        alt: ''
      }
    })

    // Reset form when dictionary changes (locale changes) to update validation messages
    useEffect(() => {
      if (isOpen && currentMedia) {
        reset({
          file_name: currentMedia.file_name || '',
          alt: currentMedia.alt || ''
        })
      }
    }, [dictionary, reset, isOpen, currentMedia])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      open: (media: components['schemas']['FileResource']) => {
        setCurrentMedia(media)
        reset({
          file_name: media.file_name || '',
          alt: media.alt || ''
        })
        setIsOpen(true)
      },
      close: () => {
        setIsOpen(false)
        reset()
        setCurrentMedia(null)
      }
    }))

    // Functions
    const onSubmit = async (data: FormData) => {
      if (!currentMedia?.id) return

      await updateMedia({
        body: {
          file_name: data.file_name,
          alt: data.alt || ''
        },
        params: {
          path: {
            id: currentMedia.id
          }
        }
      })
        .then(() => {
          toast.success((dictionary as any).messages?.media_updated_successfully || 'Media updated successfully')
          setIsOpen(false)
          reset()
          setCurrentMedia(null)
          onSuccess?.()
        })
        .catch(e => {
          setFormErrors(e, setError)
        })
    }

    return (
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{(dictionary as any).titles?.editMedia || 'Edit Media'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {currentMedia?.original_url && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Box
                  component='img'
                  src={currentMedia.original_url}
                  alt={currentMedia.alt || currentMedia.file_name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid var(--mui-palette-divider)'
                  }}
                />
              </Box>
            )}

            <Controller
              name='file_name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={keywordsTranslate.file_name || 'File Name'}
                  placeholder={`${keywordsTranslate.file_name || 'file name'}`}
                  error={!!errors.file_name}
                  helperText={errors.file_name?.message}
                  disabled={isUpdating}
                />
              )}
            />

            <Controller
              name='alt'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={keywordsTranslate.alt || 'Alt Text'}
                  placeholder={`${keywordsTranslate.alt || 'alt text'}`}
                  multiline
                  rows={3}
                  error={!!errors.alt}
                  helperText={errors.alt?.message}
                  disabled={isUpdating}
                />
              )}
            />

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setIsOpen(false)}
            disabled={isUpdating}
            variant='outlined'
          >
            {keywordsTranslate.cancel}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isUpdating}
            variant='contained'
            startIcon={isUpdating && <CircularProgress size={20} />}
          >
            {isUpdating ? keywordsTranslate.saving : keywordsTranslate.save}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
)

EditMediaModal.displayName = 'EditMediaModal'

export default EditMediaModal
