// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import BlogForm from '@/views/blogs/components/BlogForm'

const page = async ({ params }: { params: { lang: Locale; id: number } }) => {
  const dictionary = await getDictionary(params.lang)

  return <BlogForm dictionary={dictionary} id={params.id} type='blog' />
}

export default page
