// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import ExpertiseForm from '@/views/expertises/components/ExpertiseForm'

const page = async ({ params }: { params: { lang: Locale; id: number } }) => {
  const dictionary = await getDictionary(params.lang)

  return <ExpertiseForm dictionary={dictionary} id={params.id} />
}

export default page
