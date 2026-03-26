import { computed, ref } from 'vue'
import { useSummaryQuery } from './useSummary'
import {
  formatMonthParam,
  useMonthlyHistoryRangeQuery,
  useTransactionsQuery
  // type TransactionItem
} from './useTransactions'

type DashboardSection =
  | 'empty-overview'
  | 'spending-by-category'
  | 'monthly-trend'

const SAVINGS_GOAL_PERCENT = 25

export const useDashboard = () => {
  const selectedRangeMonths = ref(6)
  const now = new Date()

  const currentMonthParam = computed(() => formatMonthParam(now))
  const previousMonthParam = computed(() =>
    formatMonthParam(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  )

  const transactionsQuery = useTransactionsQuery()
  const currentSummaryQuery = useSummaryQuery(currentMonthParam)
  const previousSummaryQuery = useSummaryQuery(previousMonthParam)
  const monthHistoryQuery = useMonthlyHistoryRangeQuery(selectedRangeMonths)

  const transactions = computed(() => transactionsQuery.data.value ?? [])
  const currentSummary = computed(
    () =>
      currentSummaryQuery.data.value ?? {
        income: 0,
        expense: 0,
        balance: 0
      }
  )
  const previousSummary = computed(
    () =>
      previousSummaryQuery.data.value ?? {
        income: 0,
        expense: 0,
        balance: 0
      }
  )
  const monthHistories = computed(() => monthHistoryQuery.data.value ?? [])

  const totalTransactions = computed(() => transactions.value.length)

  const monthsWithTransactions = computed(() => {
    const months = new Set(
      transactions.value.map(item => item.transactionDate.slice(0, 7))
    )

    return months.size
  })

  const currentMonthTransactions = computed(() =>
    transactions.value.filter(
      item => item.transactionDate.slice(0, 7) === currentMonthParam.value
    )
  )

  const recentTransactions = computed(() => transactions.value.slice(0, 5))

  const dashboardSection = computed<DashboardSection>(() => {
    if (totalTransactions.value < 5) {
      return 'empty-overview'
    }

    if (monthsWithTransactions.value < 2) {
      return 'spending-by-category'
    }

    return 'monthly-trend'
  })

  const savingsRate = computed(() => {
    if (currentSummary.value.income <= 0) {
      return 0
    }

    return (currentSummary.value.balance / currentSummary.value.income) * 100
  })

  const expenseSourceForCategory = computed(() => {
    const currentMonthExpense = currentMonthTransactions.value.filter(
      item => item.type === 'expense'
    )

    if (currentMonthExpense.length > 0) {
      return currentMonthExpense
    }

    return transactions.value.filter(item => item.type === 'expense')
  })

  const categoryBreakdown = computed(() => {
    const grouped = expenseSourceForCategory.value.reduce<
      Record<string, number>
    >((acc, item) => {
      const label = item.category?.categoryname || 'Lainnya'
      acc[label] = (acc[label] || 0) + Number(item.amount)
      return acc
    }, {})

    const sorted = Object.entries(grouped)
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total)

    const topFive = sorted.slice(0, 5)
    const totalExpense = topFive.reduce((sum, item) => sum + item.total, 0)

    return topFive.map(item => ({
      ...item,
      percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0
    }))
  })

  const monthlyTrendLabels = computed(() =>
    monthHistories.value.map(item => item.label)
  )

  const monthlyTrendSeries = computed(() => [
    {
      name: 'Pengeluaran',
      data: monthHistories.value.map(item => item.expense)
    },
    {
      name: 'Pemasukan',
      data: monthHistories.value.map(item => item.income)
    }
  ])

  const isStatsLoading = computed(
    () =>
      currentSummaryQuery.isPending.value ||
      previousSummaryQuery.isPending.value
  )

  const isInsightLoading = computed(
    () => transactionsQuery.isPending.value || monthHistoryQuery.isPending.value
  )

  return {
    selectedRangeMonths,
    savingsGoalPercent: ref(SAVINGS_GOAL_PERCENT),

    transactions,
    recentTransactions,
    totalTransactions,
    currentMonthTransactions,
    monthsWithTransactions,

    currentSummary,
    previousSummary,
    savingsRate,

    dashboardSection,
    categoryBreakdown,
    monthlyTrendLabels,
    monthlyTrendSeries,

    isStatsLoading,
    isInsightLoading
  }
}
