// Utils Imports
import Grid from '@mui/material/Grid'

import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import SlidersListTable from '@/views/sliders/list/SlidersListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <SlidersListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
