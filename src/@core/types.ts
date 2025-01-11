// React Imports
import type { ReactNode } from 'react'

export type Layout = 'vertical' | 'collapsed' | 'horizontal'

export type Skin = 'default' | 'bordered'

export type Mode = 'system' | 'light' | 'dark'

export type SystemMode = 'light' | 'dark'

export type Direction = 'ltr' | 'rtl'

export type LayoutComponentWidth = 'compact' | 'wide'

export type LayoutComponentPosition = 'fixed' | 'static'

export type ChildrenType = {
  children: ReactNode
}

export type ThemeColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'

export type ModalHandle = {
  open: () => void
  close: () => void
}

export type WithActions<T> = T & {
  actions?: string
}

export type OptionType = {
  label: string
  value: string | number
}

export type ImageMimeType =
  | 'image/jpeg'
  | 'image/jpg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'image/bmp'
  | 'image/tiff'
  | 'image/svg+xml'
  | 'image/x-icon'
  | undefined

export type VideoMimeType =
  | 'video/mp4'
  | 'video/webm'
  | 'video/ogg'
  | 'video/avi'
  | 'video/mpeg'
  | 'video/quicktime'
  | 'video/x-ms-wmv'
  | 'video/x-msvideo'
  | 'video/x-flv'
  | undefined
