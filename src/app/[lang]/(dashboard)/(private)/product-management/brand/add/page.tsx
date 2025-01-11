// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import BrandForm from '@/views/product-management/brands/components/BrandForm'

const page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return <BrandForm dictionary={dictionary} />
}

export default page
