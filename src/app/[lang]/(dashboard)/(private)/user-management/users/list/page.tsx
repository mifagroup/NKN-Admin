// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Data Imports
import { getDictionary } from '@/utils/getDictionary'
import UsersListTable from '@/views/user-management/list/UsersListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <UsersListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page 
