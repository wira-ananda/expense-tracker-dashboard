import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
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
  id: string
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

type MeResponse = {
  id: string
  username: string
  email: string
}

export const useMeQuery = () => {
  const axiosInstance = useAxiosInstance()
  const authToken = useCookie<string | null>('auth_token')

  return useQuery<MeResponse>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<MeResponse>('/auth/me')
      return data
    },
    enabled: computed(() => !!authToken.value),
    retry: false
  })
}

export const useLoginMutation = () => {
  const axiosInstance = useAxiosInstance()
  const queryClient = useQueryClient()
  const authToken = useCookie<string | null>('auth_token')

  return useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: async (userData: LoginPayload) => {
      const { data } = await axiosInstance.post<LoginResponse>('/auth/login', {
        usernameOrEmail: userData.usernameOrEmail,
        password: userData.password
      })

      authToken.value = data.token
      return data
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['auth', 'me']
      })

      await navigateTo('/', { replace: true })
    },

    onError: (err: any) => {
      if (err?.response?.status === 401) {
        alert('Username/email atau password salah')
        return
      }

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

    onError: (err: any) => {
      errorMiddleware(err)
    }
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const authToken = useCookie<string | null>('auth_token')

  const logout = async () => {
    authToken.value = null

    queryClient.removeQueries({
      queryKey: ['auth', 'me']
    })

    await navigateTo('/auth/login', { replace: true })
  }

  return {
    logout
  }
}
