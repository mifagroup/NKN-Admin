import { useState, useImperativeHandle, forwardRef } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'

interface FormDrawerProps {
  title: string
  children?: React.ReactNode
}

export type DrawerHandle = {
  open: () => void
  close: () => void
}

const FormDrawer = forwardRef<DrawerHandle, FormDrawerProps>(({ title, children }, ref) => {
  // States
  const [open, setOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    open: () => openDrawer(),
    close: () => closeDrawer()
  }))

  // Functions
  const openDrawer = () => setOpen(true)
  const closeDrawer = () => setOpen(false)

  const handleClose = () => {
    closeDrawer()
  }

  if (!open) return null

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: false }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>{title}</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      {children}
    </Drawer>
  )
})

export default FormDrawer
