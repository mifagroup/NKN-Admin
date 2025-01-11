// Utils Imports
import Grid from '@mui/material/Grid'

import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import UnitsListTable from '@/views/settings/units/list/UnitsListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      {dictionary.navigation.dashboard}
    </Grid>
  )
}

export default Page
