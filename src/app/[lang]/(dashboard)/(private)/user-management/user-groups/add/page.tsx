// Type Imports
import type { Locale } from '@/configs/i18n'

// Component Imports
import { getDictionary } from '@/utils/getDictionary'
import UserGroupForm from '@/views/user-management/user-groups/components/UserGroupForm'

const page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return <UserGroupForm dictionary={dictionary} />
}

export default page
