// Component Imports
import Grid from '@mui/material/Grid'

import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import ProfitListTable from '@/views/financial-management/profit/list/ProfitListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <ProfitListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
