// Utils Imports
import Grid from '@mui/material/Grid'

import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'
import PricingPlansListTable from '@/views/product-management/pricing-plans/list/PricingPlansListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <PricingPlansListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
