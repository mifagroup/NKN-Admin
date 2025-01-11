// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import AttributesListTable from '@/views/product-management/attributes/list/AttributesListTable'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Data Imports
import { getDictionary } from '@/utils/getDictionary'
import AttributesGroupListTable from '@/views/product-management/attributesGroup/list/AttributesGroupListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <AttributesGroupListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
