// MUI Imports
import { Grid } from '@mui/material'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Components Imports
import TagsListTable from '@/views/product-management/tags/list/TagsListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <TagsListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page
