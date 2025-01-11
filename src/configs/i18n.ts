export const i18n = {
  defaultLocale: 'fa',
  locales: ['en','fa'],
  langDirection: {
    en: 'ltr',
    fa: 'rtl',
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
