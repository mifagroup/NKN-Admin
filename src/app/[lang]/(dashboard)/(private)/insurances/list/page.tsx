// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import InsuranceListTable from '@/views/insurances/list/InsuranceListTable'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Data Imports
import { getDictionary } from '@/utils/getDictionary'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <InsuranceListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
