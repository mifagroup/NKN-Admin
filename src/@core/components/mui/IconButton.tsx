'use client'

import Link from 'next/link'

import MuiButton, { type ButtonProps } from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'

// Config Imports
import themeConfig from '@configs/themeConfig'

interface CustomIconButtonProps extends ButtonProps {
  title?: string
}

const StyledButton = styled(MuiButton)(({ color, size, theme, variant }) => ({
  minInlineSize: 0,
  ...(size === 'small'
    ? {
        fontSize: '20px',
        padding: theme.spacing(variant === 'outlined' ? 1.5 : 1.75),
        '& i, & svg': {
          fontSize: 'inherit'
        },
        minHeight: '36px',
        maxHeight: '36px'
      }
    : size === 'large'
      ? {
          fontSize: '24px',
          padding: theme.spacing(variant === 'outlined' ? 2 : 2.25),
          '& i, & svg': {
            fontSize: 'inherit'
          }
        }
      : {
          fontSize: '22px',
          padding: theme.spacing(variant === 'outlined' ? 1.75 : 2),
          '& i, & svg': {
            fontSize: 'inherit'
          }
        }),
  ...(!color && {
    color: 'var(--mui-palette-action-active)',
    '&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active': {
      backgroundColor: 'rgb(var(--mui-palette-text-primaryChannel) / 0.08)'
    },
    ...(themeConfig.disableRipple && {
      '&.Mui-focusVisible:not(.Mui-disabled)': {
        backgroundColor: 'rgb(var(--mui-palette-text-primaryChannel) / 0.08)'
      }
    }),
    '&.Mui-disabled': {
      opacity: 0.45,
      color: 'var(--mui-palette-action-active)'
    },
    ...(variant === 'outlined' && {
      border: 'none !important',
      padding: theme.spacing(size === 'small' ? 1.75 : size === 'large' ? 2.25 : 2)
    }),
    ...(variant === 'contained' && {
      boxShadow: 'none !important',
      backgroundColor: 'transparent'
    })
  })
})) as typeof MuiButton

const CustomIconButton: React.FC<CustomIconButtonProps> = ({ title, ...props }) => {
  return title ? (
    <Tooltip title={title}>
      <StyledButton {...props} LinkComponent={Link} />
    </Tooltip>
  ) : (
    <StyledButton {...props} />
  )
}

export default CustomIconButton
