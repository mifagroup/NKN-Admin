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

  // If src is empty or invalid, use default image
  const imageSrc = !src || src.trim() === '' ? '/images/defaults/default-entity-image.svg' : src
  const shouldUseDefault = defaultImage || !src || src.trim() === ''

  return (
    <>
      <NextImage
        src={shouldUseDefault ? '/images/defaults/default-entity-image.svg' : imageSrc}
        width={width ?? 40}
        height={height ?? 40}
        alt={alt}
        onClick={() => {
          if (!shouldUseDefault) {
            setOpen(true)
          }
        }}
        className={`w-[50px] h-[50px] ${className} ${!shouldUseDefault && 'cursor-pointer'}`}
        onError={e => setDefaultImage(e.type === 'error' ? true : false)}
        unoptimized={imageSrc.startsWith('http')}
      />
      {src && src.trim() !== '' && (
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
                src={imageSrc}
                alt='image'
                fill
                className='outline-none object-contain max-w-[70%] max-h-[70%] border-primaryLight border-2 rounded-lg bg-backdrop !relative'
                unoptimized={imageSrc.startsWith('http')}
              />
            </div>
          </Slide>
        </Modal>
      )}
    </>
  )
}

export default Image
