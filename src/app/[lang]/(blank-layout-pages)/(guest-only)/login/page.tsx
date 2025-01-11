// Next Imports
import type { Metadata } from 'next'

// Component Imports
import Login from '@views/Login'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { getDictionary } from '@/utils/getDictionary'

// Type Import
import type { Locale } from '@/configs/i18n'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = async ({ params }: { params: { lang: Locale } }) => {
  // Vars
  const mode = getServerMode()

  const dictionary = await getDictionary(params.lang)

  return <Login mode={mode} dictionary={dictionary} />
}

export default LoginPage
