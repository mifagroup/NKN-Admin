import { useFetch } from '@/utils/clientRequest'

export const useMe = () => {
  const { data, isLoading } = useFetch().useQuery('get', '/auth')

  return { data, isLoading }
}
