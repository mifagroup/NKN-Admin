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

export type ImageMimeType = 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp' | 'bmp' | 'tiff' | 'svg+xml' | 'x-icon' | undefined

export type VideoMimeType =
  | 'mp4'
  | 'webm'
  | 'ogg'
  | 'avi'
  | 'mpeg'
  | 'quicktime'
  | 'x-ms-wmv'
  | 'x-msvideo'
  | 'x-flv'
  | undefined
