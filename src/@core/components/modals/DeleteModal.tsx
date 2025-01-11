// React Imports
import React, { useState, useImperativeHandle, forwardRef, type ReactNode } from 'react'

// Third-party Imports
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import LoadingButton from '@mui/lab/LoadingButton'

// Utils Imports
import { useGetDictionary } from '@/utils/useGetDictionary'
import { type ModalHandle } from '@/@core/types'

interface ModalProps {
  children: ReactNode
  title: string
  handleConfirm: () => void
  isLoadingConfirmation: boolean
}

const DeleteModal = forwardRef<ModalHandle, ModalProps>(
  ({ children, title, handleConfirm, isLoadingConfirmation }, ref) => {
    // States
    const [open, setOpen] = useState(false)

    // Hooks
    const dictionary = useGetDictionary()

    useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false)
    }))

    // Vars
    const keywordsTranslate = dictionary?.keywords

    // Functions
    const handleClose = () => setOpen(false)

    return (
      <Dialog open={open} onClose={handleClose} fullWidth transitionDuration={400}>
        {title && (
          <DialogTitle display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant='h5'>{title}</Typography>
            <IconButton onClick={handleClose}>
              <i className='ri-close-line' />
            </IconButton>
          </DialogTitle>
        )}
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: 6
          }}
        >
          <Box>{children}</Box>
          <Box display={'flex'} alignItems={'center'} columnGap={2} justifyContent={'end'}>
            <LoadingButton variant='outlined' color='error' onClick={handleClose}>
              {keywordsTranslate?.cancel}
            </LoadingButton>
            <LoadingButton variant='contained' onClick={handleConfirm} loading={isLoadingConfirmation}>
              {keywordsTranslate?.confirm}
            </LoadingButton>
          </Box>
        </DialogContent>
      </Dialog>
    )
  }
)

export default DeleteModal
