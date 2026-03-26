import { computed, unref, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useAxiosInstance } from './useAxiosInstance'

type MaybeNumber = Ref<number> | number

export type TransactionType = 'income' | 'expense'

export type TransactionCategory = {
  id: string
  userId: string
  categoryname: string
  type: TransactionType
}

export type TransactionItem = {
  id: string
  userId: string
  categoryId: string
  type: TransactionType
  amount: number
  note: string | null
  transactionDate: string
  category?: TransactionCategory
}

export type MonthlyHistoryItem = {
  key: string
  label: string
  year: number
  month: number
  income: number
  expense: number
  balance: number
  transactions: TransactionItem[]
}

type RawTransactionItem = Omit<TransactionItem, 'amount'> & {
  amount: string | number
}

type RawMonthlyHistoryResponse = {
  year: number
  month: number
  income: string | number
  expense: string | number
  balance: string | number
  transactions: RawTransactionItem[]
}

const toNumber = (value: string | number | null | undefined) =>
  Number(value ?? 0)

const normalizeTransaction = (item: RawTransactionItem): TransactionItem => ({
  ...item,
  amount: toNumber(item.amount),
  note: item.note ?? null
})

export const formatMonthParam = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const buildMonthKey = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, '0')}`

const buildMonthLabel = (date: Date) =>
  date.toLocaleDateString('id-ID', {
    month: 'short'
  })

const buildRequestedMonths = (count: number) => {
  const safeCount = Math.max(count, 1)
  const today = new Date()

  return Array.from({ length: safeCount }, (_, index) => {
    const offset = safeCount - index - 1
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1)

    return {
      key: buildMonthKey(date.getFullYear(), date.getMonth() + 1),
      label: buildMonthLabel(date),
      year: date.getFullYear(),
      month: date.getMonth() + 1
    }
  })
}

const normalizeMonthlyHistory = (
  item: RawMonthlyHistoryResponse,
  meta: { key: string; label: string }
): MonthlyHistoryItem => ({
  key: meta.key,
  label: meta.label,
  year: item.year,
  month: item.month,
  income: toNumber(item.income),
  expense: toNumber(item.expense),
  balance: toNumber(item.balance),
  transactions: Array.isArray(item.transactions)
    ? item.transactions.map(normalizeTransaction)
    : []
})

export const useTransactionsQuery = () => {
  const axiosInstance = useAxiosInstance()

  return useQuery<TransactionItem[]>({
    queryKey: ['transactions', 'all'],
    queryFn: async () => {
      const { data } =
        await axiosInstance.get<RawTransactionItem[]>('/transactions')
      return Array.isArray(data) ? data.map(normalizeTransaction) : []
    },
    staleTime: 60_000
  })
}

export const useMonthlyHistoryRangeQuery = (monthsCount: MaybeNumber) => {
  const axiosInstance = useAxiosInstance()

  return useQuery<MonthlyHistoryItem[]>({
    queryKey: computed(() => [
      'transactions',
      'history-range',
      unref(monthsCount)
    ]),
    queryFn: async () => {
      const requestedMonths = buildRequestedMonths(unref(monthsCount))

      const responses = await Promise.all(
        requestedMonths.map(async (item) => {
          const { data } = await axiosInstance.get<RawMonthlyHistoryResponse>(
            '/transactions/history/by-month',
            {
              params: {
                year: item.year,
                month: item.month
              }
            }
          )

          return normalizeMonthlyHistory(data, {
            key: item.key,
            label: item.label
          })
        })
      )

      return responses
    },
    staleTime: 60_000
  })
}
