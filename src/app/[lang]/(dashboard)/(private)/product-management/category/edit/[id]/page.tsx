// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import CategoryForm from '@/views/product-management/categories/components/CategoryForm'

const page = async ({ params }: { params: { lang: Locale; id: number } }) => {
  const dictionary = await getDictionary(params.lang)

  return <CategoryForm dictionary={dictionary} id={params.id} type='product' />
}

export default page
