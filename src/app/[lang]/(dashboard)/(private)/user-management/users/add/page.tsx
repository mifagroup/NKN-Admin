// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import UserForm from '@/views/user-management/components/UserForm'

const page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return <UserForm dictionary={dictionary} />
}

export default page 
