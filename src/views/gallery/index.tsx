// Type Imports
import type { getDictionary } from '@/utils/getDictionary'

// Component Imports
import GalleryListTable from './list/GalleryListTable'

const Gallery = ({ dictionary }: { dictionary: Awaited<ReturnType<typeof getDictionary>> }) => {
  return <GalleryListTable dictionary={dictionary} />
}

export default Gallery