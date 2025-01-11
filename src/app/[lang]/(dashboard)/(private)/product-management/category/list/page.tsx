// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import CategoriesListTable from '@/views/product-management/categories/list/CategoriesListTable'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Data Imports
import { getDictionary } from '@/utils/getDictionary'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <CategoriesListTable dictionary={dictionary} type='product' />
    </Grid>
  )
}

export default Page
