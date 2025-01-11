// Component Imports
import Grid from '@mui/material/Grid'

import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import CommentsListTable from '@/views/messages-management/comments/list/CommentsListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <CommentsListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
