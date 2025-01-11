// React Imports
import { type HTMLAttributes, useState } from 'react'

// Utils Imports
import { Modal, Backdrop, Slide } from '@mui/material'

type VideoProps = {
  src: File | string
  preview: string
  className?: HTMLAttributes<HTMLImageElement>['className']
}

const Video: React.FC<VideoProps> = ({ src, className, preview }) => {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <video
        src={preview}
        width={40}
        height={40}
        onClick={() => {
          if (preview) {
            setOpen(true)
          }
        }}
        className={`w-[50px] h-[50px] ${className} ${src && 'cursor-pointer'} object-cover rounded-md`}
      />
      {src && (
        <Modal
          open={open}
          onClose={handleClose}
          closeAfterTransition
          slots={{
            backdrop: Backdrop
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Slide
            in={open}
            direction='up'
            timeout={400}
            style={{
              alignSelf: 'center',
              justifySelf: 'center'
            }}
          >
            <video width={400} height={400} controls src={typeof src === 'string' ? src : undefined} className='z-10'>
              <source
                src={typeof src === 'string' ? src : URL.createObjectURL(src)}
                type={typeof src === 'string' ? 'mp4' : src.type}
              />
            </video>
          </Slide>
        </Modal>
      )}
    </>
  )
}

export default Video
