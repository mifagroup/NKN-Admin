// React Imports
import { type HTMLAttributes, useState } from 'react'

// Next Imports
import NextImage from 'next/image'

// Utils Imports
import { Modal, Backdrop, Slide } from '@mui/material'

type ImageProps = {
  src: string
  alt: string
  width?: number
  height?: number
  className?: HTMLAttributes<HTMLImageElement>['className']
}

const Image: React.FC<ImageProps> = ({ src, alt, width, height, className }) => {
  const [open, setOpen] = useState(false)

  const [defaultImage, setDefaultImage] = useState<boolean>()

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <NextImage
        src={defaultImage ? '/images/defaults/default-entity-image.svg' : src}
        width={width ?? 40}
        height={height ?? 40}
        alt={alt}
        onClick={() => {
          if (!defaultImage) {
            setOpen(true)
          }
        }}
        className={`w-[50px] h-[50px] ${className} ${!defaultImage && 'cursor-pointer'}`}
        onError={e => setDefaultImage(e.type === 'error' ? true : false)}
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
            <div className='w-full h-full flex items-center justify-center focus-visible:outline-none border-none'>
              <NextImage
                src={src}
                alt='image'
                fill
                className='outline-none object-contain max-w-[70%] max-h-[70%] border-primaryLight border-2 rounded-lg bg-backdrop !relative'
              />
            </div>
          </Slide>
        </Modal>
      )}
    </>
  )
}

export default Image
