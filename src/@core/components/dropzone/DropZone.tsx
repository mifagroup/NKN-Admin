'use client'

// React Imports
import { useState } from 'react'

// Utils Imports
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import type { BoxProps } from '@mui/material/Box'
import { useDropzone } from 'react-dropzone'

import { toast } from 'react-toastify'

import CustomAvatar from '@core/components/mui/Avatar'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'
import Image from '../image'
import Cropper from '../cropper/Cropper'
import { useGetDictionary } from '@/utils/useGetDictionary'
import { translateReplacer } from '@/utils/translateReplacer'
import Video from '../video'
import type { ImageMimeType, VideoMimeType } from '@/@core/types'
import { validImageMimeTypes, validVideoMimeTypes } from '@/configs/mediaMimeTypes'

// Styled Dropzone Component
const Dropzone = styled(AppReactDropzone)<BoxProps>(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    paddingInline: theme.spacing(5),
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

type DropZoneProps = {
  files: File[] | string[]
  setFiles: React.Dispatch<React.SetStateAction<File[] | string[]>>
  multiple?: boolean
  aspect?: number
  error?: boolean
  type: 'media' | 'image' | 'file'
  mimeType?: ImageMimeType | VideoMimeType
}

const DropZone: React.FC<DropZoneProps> = ({
  files,
  setFiles,
  multiple = false,
  aspect = 1,
  error,
  type = 'image',
  mimeType
}) => {
  // States
  const [src, setSrc] = useState<string>()

  const [cropperOpen, setCropperOpen] = useState(false)

  // Hooks

  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  const dropzoneTranslate = dictionary?.dropzone

  const acceptConfig = {
    image: { 'image/*': [] },
    file: {
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'text/plain': []
    },
    media: { 'image/*': [], 'video/*': [] }
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const maxSizeMB = 10
      const maxSizeBytes = maxSizeMB * 1024 * 1024

      const oversizedFiles = acceptedFiles.filter(file => file.size > maxSizeBytes)

      if (oversizedFiles.length > 0) {
        toast.error(`${translateReplacer(dropzoneTranslate?.oversized_file_error ?? '', maxSizeMB.toString())}`)

        return
      }

      if (acceptedFiles.length > 0) {
        acceptedFiles.forEach(file => {
          const mimeType = file.type?.split('/')[1]

          if (validImageMimeTypes?.includes(mimeType as ImageMimeType)) {
            // Process image files
            const reader = new FileReader()

            reader.addEventListener('load', () => setSrc(reader.result?.toString() || ''))
            reader.readAsDataURL(file)
            setFiles(acceptedFiles)
          } else if (validVideoMimeTypes?.includes(mimeType as VideoMimeType)) {
            // Process media files (video or audio)
            setFiles(acceptedFiles)
          } else {
            // Process other files
            setFiles(acceptedFiles)
          }
        })
      }
    },
    multiple: false,
    accept: acceptConfig[type] || {}
  })

  // Functions
  const renderFilePreview = (file: File | string) => {
    if (typeof file === 'string') {
      if (validImageMimeTypes?.includes(mimeType as ImageMimeType))
        return <Image width={50} height={50} alt={'image'} src={file} className='object-contain' />
      if (validVideoMimeTypes?.includes(mimeType as VideoMimeType)) return <Video preview={file} src={file} />
    } else if (file.type.startsWith('image')) {
      return (
        <Image
          width={50}
          height={50}
          alt={file.name}
          src={URL.createObjectURL(file as any)}
          className='object-contain'
        />
      )
    } else if (file.type.startsWith('application')) {
      return <i className='ri-file-text-line' />
    } else if (file.type.startsWith('video')) {
      return <Video preview={URL.createObjectURL(file as any)} src={file} />
    }
  }

  const handleRemoveFile = (file: File | string) => {
    const uploadedFiles = files

    if (uploadedFiles.every(file => typeof file === 'string')) {
      setFiles(uploadedFiles?.filter(stringFile => stringFile !== file))
    } else {
      const filtered = uploadedFiles.filter((i: File) => i.lastModified !== (file as File).lastModified)

      setFiles([...filtered])
    }
  }

  const fileList = files?.length
    ? files?.map((file: File | string) => {
        if (typeof file === 'string') {
          return (
            <ListItem key={file} className='p-2'>
              <div className='file-details'>
                <div className='file-preview'>{renderFilePreview(file)}</div>
              </div>
              <IconButton onClick={() => handleRemoveFile(file)}>
                <i className='ri-close-line text-xl' />
              </IconButton>
            </ListItem>
          )
        } else {
          return (
            <ListItem key={file.name} className='p-2'>
              <div className='file-details'>
                <div className='file-preview'>{renderFilePreview(file)}</div>
                <div>
                  <Typography className='file-size' variant='body2'>
                    {keywordsTranslate?.size}:{' '}
                    {Math.round(file.size / 100) / 10 > 1000
                      ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} mb`
                      : `${(Math.round(file.size / 100) / 10).toFixed(1)} kb`}
                  </Typography>
                </div>
              </div>
              <IconButton onClick={() => handleRemoveFile(file)}>
                <i className='ri-close-line text-xl' />
              </IconButton>
            </ListItem>
          )
        }
      })
    : null

  return (
    <>
      <Dropzone>
        <div {...getRootProps({ className: `dropzone ${error && 'border-red-500'}` })}>
          <input {...getInputProps()} />
          <div className='flex items-center flex-col gap-x-4 gap-y-2 text-center'>
            <CustomAvatar variant='rounded' skin='light' color='secondary'>
              <i className='ri-upload-2-line' />
            </CustomAvatar>
            <Typography variant='subtitle2'>
              {translateReplacer(
                dropzoneTranslate?.title ?? '',
                type === 'image'
                  ? (dropzoneTranslate?.image ?? '')
                  : type === 'file'
                    ? (dropzoneTranslate?.file ?? '')
                    : (dropzoneTranslate?.content ?? '')
              )}
            </Typography>
          </div>
        </div>
        {files?.length ? <List>{fileList}</List> : null}
      </Dropzone>
      <Cropper
        cropperOpen={cropperOpen}
        setCropperOpen={setCropperOpen}
        setFiles={setFiles}
        files={files}
        src={src}
        aspect={aspect}
        multiple={multiple}
      />
    </>
  )
}

export default DropZone
