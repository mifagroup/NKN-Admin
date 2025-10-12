// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import InsuranceForm from '@/views/insurances/components/InsuranceForm'

const page = async ({ params }: { params: { lang: Locale; id: string } }) => {
  const dictionary = await getDictionary(params.lang)

  return <InsuranceForm dictionary={dictionary} id={Number(params.id)} />
}

export default page
