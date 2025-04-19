// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Data Imports
import { getDictionary } from '@/utils/getDictionary'
import BlogsListTable from '@/views/blogs/list/BlogsListTable'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <BlogsListTable dictionary={dictionary} type='social_responsibility' />
    </Grid>
  )
}

export default Page
