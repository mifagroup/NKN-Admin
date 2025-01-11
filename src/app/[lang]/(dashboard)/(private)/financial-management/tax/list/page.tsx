// Component Imports
import Grid from '@mui/material/Grid'

import TaxListTable from '@/views/financial-management/tax/list/TaxListTable'
import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <TaxListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
