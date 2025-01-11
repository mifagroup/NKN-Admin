// React Imports
import React, { useState } from 'react'

// Utils Imports
import { Box, Button, Dialog, DialogTitle, IconButton, Slider, Typography } from '@mui/material'
import EasyCropper from 'react-easy-crop'

import getCroppedImg from './cropImage'
import { useGetDictionary } from '@/utils/useGetDictionary'

type CropperProps = {
  cropperOpen: boolean
  setCropperOpen: React.Dispatch<React.SetStateAction<boolean>>
  setFiles: React.Dispatch<React.SetStateAction<File[] | string[]>>
  files: File[] | string[]
  src: string | undefined
  aspect: number
  multiple?: boolean
}

const Cropper: React.FC<CropperProps> = ({
  cropperOpen,
  setCropperOpen,
  files,
  setFiles,
  src,
  aspect,
  multiple = false
}) => {
  // States
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const [rotation, setRotation] = useState<number>(0)

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

  const [scale, setScale] = useState<number>(1)

  // Hooks
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const modalTranslate = dictionary?.modal

  // Functions
  const handleCloseCropper = () => {
    setCropperOpen(false)
    setScale(1)
  }

  const handleChangeScaleSlider = (event: Event, newValue: number | number[]) => {
    setScale(newValue as number)
  }

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const selectCroppedImage = async () => {
    try {
      await getCroppedImg(src!, croppedAreaPixels, rotation)
        .then(res => {
          if (res) {
            if (files.every(file => typeof file === 'string')) {
              setFiles([res])
            } else {
              setFiles(multiple ? [...files, res] : [res])
            }

            setCropperOpen(false)
          }
        })
        .then(() => {
          setTimeout(() => {
            setCrop({ x: 0, y: 0 })
            setRotation(0)
            setScale(1)
          }, 500)
        })
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={cropperOpen} onClose={handleCloseCropper} fullWidth>
      <DialogTitle display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <Typography>{modalTranslate?.imageCropper}</Typography>
        <IconButton onClick={handleCloseCropper}>
          <i className='ri-close-circle-line' />
        </IconButton>
      </DialogTitle>
      <Box sx={{ paddingX: 5, paddingBottom: 5, rowGap: 5 }} display={'flex'} flexDirection={'column'}>
        {!!src && (
          <EasyCropper
            image={src}
            crop={crop}
            rotation={rotation}
            zoom={scale}
            aspect={aspect}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setScale}
            classes={{ containerClassName: 'relative h-[400px] w-full' }}
            showGrid={false}
          />
        )}
        <Box rowGap={2} display={'flex'} flexDirection={'column'}>
          <Typography>{keywordsTranslate?.scale}</Typography>
          <Box display={'flex'} alignItems={'center'} columnGap={5}>
            <Typography>1</Typography>
            <Slider
              defaultValue={1}
              value={scale}
              aria-label='Default'
              valueLabelDisplay='auto'
              max={10}
              min={1}
              step={0.01}
              onChange={handleChangeScaleSlider}
            />
            <Typography>10</Typography>
          </Box>
        </Box>

        <Button variant='contained' color='primary' onClick={selectCroppedImage}>
          {keywordsTranslate?.select}
        </Button>
      </Box>
    </Dialog>
  )
}

export default Cropper
