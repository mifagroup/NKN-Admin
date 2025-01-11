import { useQueryClient } from '@tanstack/react-query'

import { type operations } from '../api/v1'

export const useSplash = () => {
  const queryClient = useQueryClient()

  const splashData = queryClient.getQueryData<
    operations['splashAdmin']['responses']['200']['content']['application/json']
  >([
    'get',
    '/splash-admin',
    {
      params: {
        query: {
          admin_version: '1.0.0',
          browser: 'chrome'
        }
      }
    }
  ])

  return splashData?.data
}
