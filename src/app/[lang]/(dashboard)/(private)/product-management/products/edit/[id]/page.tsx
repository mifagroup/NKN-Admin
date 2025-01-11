// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'

import ProductEditForm from '@/views/product-management/products/components/ProductEditForm'

const page = async ({ params }: { params: { lang: Locale; id: number } }) => {
  const dictionary = await getDictionary(params.lang)

  return <ProductEditForm dictionary={dictionary} id={params.id} type='product' />
}

export default page
