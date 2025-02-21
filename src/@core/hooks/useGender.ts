import { useGetDictionary } from '@/utils/useGetDictionary'

export const useGenders = () => {
  const dictionary = useGetDictionary()

  const keywordsTranslate = dictionary?.keywords

  return [
    {
      value: 'male',
      label: keywordsTranslate?.male
    },
    {
      value: 'female',
      label: keywordsTranslate?.female
    }
  ]
}
