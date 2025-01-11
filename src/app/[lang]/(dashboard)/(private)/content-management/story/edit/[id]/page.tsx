// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import StoryForm from '@/views/content-management/stories/components/StoryForm'

const page = async ({ params }: { params: { lang: Locale; id: number } }) => {
  const dictionary = await getDictionary(params.lang)

  return <StoryForm dictionary={dictionary} id={params.id} />
}

export default page
