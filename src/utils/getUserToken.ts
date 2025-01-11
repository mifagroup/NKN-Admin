import { getServerSession } from 'next-auth/next'

export const getUserToken = async (): Promise<string | null> => {
  const session = await getServerSession()

  // Assuming token is stored in session as accessToken
  const token = session?.user.token || null

  return token
}
