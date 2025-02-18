import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      fist_name: string
      last_name: string
      full_name: string
      phone: string
      email: string
      accessToken?: string
    }
    accessToken?: string
  }
  interface User {
    id: number
    fist_name: string
    last_name: string
    full_name: string
    phone: string
    email: string
    accessToken?: string
  }
}
