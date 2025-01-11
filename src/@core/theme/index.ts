// Next Imports
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { Settings } from '@core/contexts/settingsContext'
import type { Skin, SystemMode } from '@core/types'

// Theme Options Imports
import overrides from './overrides'
import colorSchemes from './colorSchemes'
import spacing from './spacing'
import shadows from './shadows'
import customShadows from './customShadows'
import typography from './typography'
import tooltip from './overrides/tooltip'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] })

const iranYekan = localFont({
  src: [
    {
      path: '../../../public/fonts/IRANYekanXFaNum-UltraLight.ttf',
      weight: '100'
    },
    {
      path: '../../../public/fonts/IRANYekanXFaNum-Light.ttf',
      weight: '200'
    },
    {
      path: '../../../public/fonts/IRANYekanXFaNum-Thin.ttf',
      weight: '300'
    },
    {
      path: '../../../public/fonts/IRANYekanXFaNum-Regular.ttf',
      weight: '400'
    },
    {
      path: '../../../public/fonts/IRANYekanXFaNum-Medium.ttf',
      weight: '500'
    },
    {
      path: '../../../public/fonts/IRANYekanXFaNum-SemiBold.ttf',
      weight: '600'
    },
    {
      path: '../../../public/fonts/IRANYekanXFaNum-Bold.ttf',
      weight: '700'
    },
    {
      path: '../../../public/fonts/IRANYekanXFaNum-ExtraBold.ttf',
      weight: '800'
    },
    {
      path: '../../../public/fonts/IRANYekanXFaNum-Black.ttf',
      weight: '900'
    }
  ]
})

const theme = (settings: Settings, mode: SystemMode, direction: Theme['direction']): Theme => {
  return {
    direction,
    components: {
      ...overrides(settings.skin as Skin),
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: '48px'
          }
        }
      },
      MuiTooltip: {
        ...tooltip?.MuiTooltip,
        defaultProps: {
          placement: 'top',
          arrow: true
        }
      },
      MuiTextField: {}
    },
    colorSchemes: colorSchemes(settings.skin as Skin),
    ...spacing,
    shape: {
      borderRadius: 10,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10
      }
    },
    shadows: shadows(mode),
    typography: typography(direction === 'ltr' ? inter.style.fontFamily : iranYekan.style.fontFamily),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: '38 43 67',
      dark: '234 234 255',
      lightShadow: '38 43 67',
      darkShadow: '16 17 33'
    }
  } as Theme
}

export default theme
