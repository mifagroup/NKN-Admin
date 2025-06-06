// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import AttributeForm from '@/views/product-management/attributes/components/AttributeForm'

const page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return <AttributeForm dictionary={dictionary} />
}

export default page
