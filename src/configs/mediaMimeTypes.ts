import type { ImageMimeType, VideoMimeType } from '@/@core/types'

export const validVideoMimeTypes: VideoMimeType[] | undefined = [
  'mp4',
  'webm',
  'ogg',
  'avi',
  'mpeg',
  'quicktime',
  'x-ms-wmv',
  'x-msvideo',
  'x-flv'
]

export const validImageMimeTypes: ImageMimeType[] | undefined = [
  'jpeg',
  'jpg',
  'png',
  'gif',
  'webp',
  'bmp',
  'tiff',
  'svg+xml',
  'x-icon'
]
