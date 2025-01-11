// Utils Imports
import Grid from '@mui/material/Grid'

import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import UserGroupsListTable from '@/views/user-management/user-groups/list/UserGroupsListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <UserGroupsListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
