// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import HospitalsListTable from '@/views/hospitals/list/HospitalsListTable'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Data Imports
import { getDictionary } from '@/utils/getDictionary'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <HospitalsListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
