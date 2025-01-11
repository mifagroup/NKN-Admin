// Next Imports
import { useParams } from 'next/navigation'

import { signOut, useSession } from 'next-auth/react'

// third-party Imports
import createFetchClient, { type Middleware } from 'openapi-fetch'
import createClient from 'openapi-react-query'
import { getCookie } from 'cookies-next'

// Type Imports
import { toast } from 'react-toastify'

import type { paths } from '@/@core/api/v1'

const myMiddleware: Middleware = {
  async onRequest({ request }) {
    if (
      (request.method === 'PUT' || request.method === 'PATCH') &&
      request.headers.get('content-type')?.includes('multipart/form-data')
    ) {
      const formData = await request.formData()

      formData.append('_method', request.method)

      request.headers.delete('content-type')

      return new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: formData
      })
    }

    return request
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      const serverResponse = await response.json()

      serverResponse && toast.error(serverResponse.message)

      signOut()
    }

    if (response.status === 403) {
      const serverResponse = await response.json()

      serverResponse && toast.error(serverResponse.message)
    }

    if (response.status === 404) {
      // do something
    }

    if (response.status === 500) {
      const serverResponse = await response.json()

      serverResponse && toast.error(serverResponse.message)

      return new Response(JSON.stringify({ ...serverResponse, status: 500 }), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      })
    }

    return response
  }
}

export const useFetch = () => {
  const session = useSession()

  const { lang: locale } = useParams()

  const devBaseUrl = getCookie('devBaseUrl')

  const fetchClient = createFetchClient<paths>({
    baseUrl: devBaseUrl?.length ? devBaseUrl : process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: `Bearer ${session?.data?.accessToken}`,
      Dashboard: 'admin',
      'Content-Language': locale,
      Accept: 'application/json'
    }
  })

  fetchClient.use(myMiddleware)

  return createClient(fetchClient)
}
