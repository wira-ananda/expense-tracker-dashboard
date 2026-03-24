import { useMutation } from '@tanstack/vue-query'
import errorMiddleware from '~/utils/errorMiddleware.client'
import { useAxiosInstance } from './useAxiosInstance'

type RegisterPayload = {
  username: string
  email: string
  password: string
}

type LoginPayload = {
  usernameOrEmail: string
  password: string
}

type User = {
  id?: string
  username: string
  email: string
}

type RegisterResponse = {
  message?: string
  user?: User
}

type LoginResponse = {
  id: string
  username: string
  email: string
  token: string
  [key: string]: unknown
}

export const useLoginMutation = () => {
  const axiosInstance = useAxiosInstance()

  const authToken = useCookie<string | null>('auth_token')
  const userCookie = useCookie<User | null>('user')

  return useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: async (userData: LoginPayload) => {
      console.log('LOGIN PAYLOAD:', userData)

      const { data } = await axiosInstance.post<LoginResponse>('/auth/login', {
        usernameOrEmail: userData.usernameOrEmail,
        password: userData.password
      })

      console.log('LOGIN RESPONSE:', data)

      const { id, username, email, token } = data

      authToken.value = token
      userCookie.value = { id, username, email }

      return data
    },

    onSuccess: async () => {
      console.log('LOGIN SUCCESS')
      await navigateTo('/', { replace: true })
    },

    onError: (err: Error) => {
      console.log('LOGIN ERROR FULL:', err)
      console.log('LOGIN ERROR RESPONSE:', err?.message)
      errorMiddleware(err)
    }
  })
}

export const useRegisterMutation = () => {
  const axiosInstance = useAxiosInstance()

  return useMutation<RegisterResponse, unknown, RegisterPayload>({
    mutationFn: async (userData: RegisterPayload) => {
      const { data } = await axiosInstance.post<RegisterResponse>(
        '/auth/register',
        userData
      )

      return data
    },

    onSuccess: async () => {
      await navigateTo('/auth/login', { replace: true })
    },

    onError: (err: Error) => {
      console.log('REGISTER ERROR:', err)
      errorMiddleware(err)
    }
  })
}
