// Utils Imports
import Grid from '@mui/material/Grid'

import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import SlidesListTable from '@/views/content-management/slides/list/SlidesListTable'

const Page = async ({ params }: { params: { lang: Locale; id: number } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <SlidesListTable dictionary={dictionary} id={params.id} />
    </Grid>
  )
}

export default Page
