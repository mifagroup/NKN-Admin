import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string
      family?: string
      email?: string
      mobile?: string
      id?: number
      token?: string
      image?: string
    }
    accessToken?: string
  }
  interface User {
    name?: string
    family?: string
    email?: string
    mobile?: string
    id?: number
    token?: string
    image?: string
  }
}
