// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import SlideForm from '@/views/content-management/slides/components/SlideForm'

const page = async ({ params }: { params: { lang: Locale; id: number } }) => {
  const dictionary = await getDictionary(params.lang)

  return <SlideForm dictionary={dictionary} sliderId={params.id} />
}

export default page
