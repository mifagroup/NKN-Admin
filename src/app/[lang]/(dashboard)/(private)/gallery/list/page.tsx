// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import GalleryListTable from '@/views/gallery/list/GalleryListTable'

// Type Imports
import type { Locale } from '@/configs/i18n'

// Data Imports
import { getDictionary } from '@/utils/getDictionary'

const Page = async ({ params }: { params: { lang: Locale } }) => {
  const dictionary = await getDictionary(params.lang)

  return (
    <Grid item xs={12}>
      <GalleryListTable dictionary={dictionary} />
    </Grid>
  )
}

export default Page