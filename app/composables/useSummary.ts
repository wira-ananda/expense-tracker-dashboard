import { computed, unref, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAxiosInstance } from './useAxiosInstance'

type MaybeMonth = Ref<string | undefined> | string | undefined

export type SummaryResponse = {
  income: number
  expense: number
  balance: number
}

const normalizeSummary = (
  data: Partial<SummaryResponse> | undefined
): SummaryResponse => ({
  income: Number(data?.income ?? 0),
  expense: Number(data?.expense ?? 0),
  balance: Number(data?.balance ?? 0)
})

export const useSummaryQuery = (month?: MaybeMonth) => {
  const axiosInstance = useAxiosInstance()

  return useQuery<SummaryResponse>({
    queryKey: computed(() => [
      'summary',
      month ? unref(month) || 'all' : 'all'
    ]),
    queryFn: async () => {
      const resolvedMonth = month ? unref(month) : undefined

      const { data } = await axiosInstance.get<SummaryResponse>('/summary', {
        params: resolvedMonth ? { month: resolvedMonth } : undefined
      })

      return normalizeSummary(data)
    },
    staleTime: 60_000
  })
}
