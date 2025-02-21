// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Data Imports
import { getDictionary } from '@/utils/getDictionary'
import DoctorsListTable from '@/views/doctors/list/DoctorsListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <DoctorsListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
