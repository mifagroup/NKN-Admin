// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import DoctorForm from '@/views/doctors/components/DoctorForm'

const page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return <DoctorForm dictionary={dictionary} />
}

export default page
