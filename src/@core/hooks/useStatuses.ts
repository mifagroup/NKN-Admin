import { useGetDictionary } from '@/utils/useGetDictionary'

export const useStatuses = () => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  return [
    {
      value: '1',
      label: keywordsTranslate?.active
    },
    {
      value: '0',
      label: keywordsTranslate?.inactive
    }
  ]
}
