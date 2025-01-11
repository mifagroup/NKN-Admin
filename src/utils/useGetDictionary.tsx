// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// Types Imports
import { type Locale } from '@/configs/i18n'

// Utils Imports
import { getDictionary } from './getDictionary'

export const useGetDictionary = () => {
  const { lang } = useParams()
  const [dictionary, setDictionary] = useState<Awaited<ReturnType<typeof getDictionary>>>()

  useEffect(() => {
    getDictionary(lang as Locale).then(dic => setDictionary(dic))
  }, [lang])

  return dictionary
}
