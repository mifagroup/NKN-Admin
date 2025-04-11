// Next Imports
import { cookies } from 'next/headers'

// Utils Imports
import Credentials from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'
import createClient from 'openapi-fetch'

import type { paths } from '@/@core/api/v1'

export const authOptions = () => {
  return {
    providers: [
      Credentials({
        id: 'login',
        name: 'Credentials',
        credentials: {
          email: { label: 'email', type: 'text' },
          password: { label: 'password', type: 'password' },
          mobile: { label: 'password', type: 'password' }
        },
        async authorize(credentials) {
          const { email, password } = credentials as { email: string; password: string }

          const payload = { email, password }

          const devBaseUrl = cookies().get('devBaseUrl')

          try {
            const client = createClient<paths>({
              baseUrl: devBaseUrl?.value?.length ? devBaseUrl?.value : process.env.NEXT_PUBLIC_API_URL,
              headers: {
                dashboard: 'admin',
                accept: 'application/json'
              }
            })

            const { data: apiData, error } = await client.POST('/auth', {
              body: { ...payload }
            })

            if (apiData) {
              return { ...apiData.data, accessToken: apiData.token }
            } else {
              throw new Error(JSON.stringify(error) as string)
            }
          } catch (error: any) {
            throw new Error(error?.message)
          }
        }
      })
    ],

    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60
    },

    pages: {
      signIn: '/login'
    },

    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.name = user.full_name
          token.token = user.accessToken
        }

        return token
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.email = token.email as string
          session.accessToken = token.token as string
        }

        return session
      }
    },

    cookies: {
      sessionToken: {
        name: 'auth-token',
        options: {
          httpOnly: false,
          path: '/'
        }      }
    },

    secret: process.env.NEXTAUTH_SECRET
  } satisfies NextAuthOptions
}
