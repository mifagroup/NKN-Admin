'use client'

// Next Imports
import { redirect, usePathname } from 'next/navigation'

// Config Imports
import { i18n, type Locale } from '@configs/i18n'

const LangRedirect = ({ preferredLang }: { preferredLang: Locale }) => {
  const pathname = usePathname()

  const redirectUrl = `/${preferredLang ?? i18n.defaultLocale}${pathname}`

  redirect(redirectUrl)
}

export default LangRedirect
