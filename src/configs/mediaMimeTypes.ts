import type { ImageMimeType, VideoMimeType } from '@/@core/types'

export const validVideoMimeTypes: VideoMimeType[] | undefined = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/avi',
  'video/mpeg',
  'video/quicktime',
  'video/x-ms-wmv',
  'video/x-msvideo',
  'video/x-flv'
]

export const validImageMimeTypes: ImageMimeType[] | undefined = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/x-icon'
]
