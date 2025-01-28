// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import HospitalForm from '@/views/hospitals/components/HospitalForm'

const page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return <HospitalForm dictionary={dictionary} />
}

export default page
