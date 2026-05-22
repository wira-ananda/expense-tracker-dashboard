<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ApexOptions } from 'apexcharts'
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText
} from 'lucide-vue-next'
import { useSummaryQuery } from '~/composables/useSummary'
import {
  useTransactionsQuery,
  type TransactionItem
} from '~/composables/useTransactions'

definePageMeta({
  pageTitle: 'Analisis Bulanan',
  pageSubtitle:
    'Pantau ringkasan aktivitas dan tren transaksi Anda dengan lebih mendalam.',
  headerActionLabel: 'Tambah Transaksi',
  headerActionTo: '/transactions/create',
  middleware: 'clerk-auth'
})

type MerchantVisual = {
  icon: string
  wrapperClass: string
}

const toMonthParam = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const parseMonthParam = (monthParam: string) => {
  const [yearPart, monthPart] = monthParam.split('-')
  const year = Number(yearPart)
  const month = Number(monthPart)

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    month < 1 ||
    month > 12
  ) {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return new Date(year, month - 1, 1)
}

const { data: transactions, isPending: isTransactionsPending } =
  useTransactionsQuery()

const allTransactions = computed(() => transactions.value ?? [])

const buildMonthOptionsFromTransactions = (items: TransactionItem[]) => {
  const today = new Date()
  const currentMonthDate = new Date(today.getFullYear(), today.getMonth(), 1)

  if (items.length === 0) {
    return [
      {
        value: toMonthParam(currentMonthDate),
        label: currentMonthDate.toLocaleDateString('id-ID', {
          month: 'long',
          year: 'numeric'
        })
      }
    ]
  }

  const sortedDates = [...items]
    .map(item => new Date(item.transactionDate))
    .sort((a, b) => a.getTime() - b.getTime())

  const firstDate = sortedDates[0] ?? currentMonthDate

  const earliestDate = new Date(
    firstDate.getFullYear(),
    firstDate.getMonth(),
    1
  )

  const options: { value: string; label: string }[] = []
  const cursor = new Date(currentMonthDate)

  while (cursor >= earliestDate) {
    options.push({
      value: toMonthParam(cursor),
      label: cursor.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
      })
    })

    cursor.setMonth(cursor.getMonth() - 1)
  }

  return options
}

const monthOptions = computed(() =>
  buildMonthOptionsFromTransactions(allTransactions.value)
)

const selectedMonth = ref(toMonthParam(new Date()))

watch(
  monthOptions,
  options => {
    const hasSelectedMonth = options.some(
      item => item.value === selectedMonth.value
    )

    if (!hasSelectedMonth) {
      selectedMonth.value = options[0]?.value ?? toMonthParam(new Date())
    }
  },
  { immediate: true }
)

const selectedMonthIndex = computed(() =>
  monthOptions.value.findIndex(item => item.value === selectedMonth.value)
)

const selectedMonthDate = computed(() => parseMonthParam(selectedMonth.value))

const previousMonth = computed(() => {
  const current = selectedMonthDate.value
  return toMonthParam(
    new Date(current.getFullYear(), current.getMonth() - 1, 1)
  )
})

const canGoToOlderMonth = computed(() => {
  return (
    selectedMonthIndex.value >= 0 &&
    selectedMonthIndex.value < monthOptions.value.length - 1
  )
})

const canGoToNewerMonth = computed(() => selectedMonthIndex.value > 0)

const goToOlderMonth = () => {
  if (!canGoToOlderMonth.value) return

  const nextOption = monthOptions.value[selectedMonthIndex.value + 1]
  if (!nextOption) return

  selectedMonth.value = nextOption.value
}

const goToNewerMonth = () => {
  if (!canGoToNewerMonth.value) return

  const nextOption = monthOptions.value[selectedMonthIndex.value - 1]
  if (!nextOption) return

  selectedMonth.value = nextOption.value
}

const { data: currentSummary, isPending: isSummaryPending } =
  useSummaryQuery(selectedMonth)

const { data: previousSummary } = useSummaryQuery(previousMonth)

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
})

const compactCurrencyFormatter = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1
})

const percentFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

const formatCurrency = (value: number) =>
  currencyFormatter.format(value).replace('Rp', 'Rp ')

const formatCompactCurrency = (value: number) =>
  compactCurrencyFormatter.format(value)

const formatPercent = (value: number) => `${percentFormatter.format(value)}%`

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }

  return ((current - previous) / previous) * 100
}

const formatSignedPercent = (value: number) =>
  `${value > 0 ? '+' : ''}${percentFormatter.format(value)}%`

const currentMonthTransactions = computed(() =>
  allTransactions.value.filter(
    item => item.transactionDate.slice(0, 7) === selectedMonth.value
  )
)

const currentMonthExpenseTransactions = computed(() =>
  currentMonthTransactions.value.filter(item => item.type === 'expense')
)

const incomeChange = computed(() =>
  calculateChange(
    Number(currentSummary.value?.income ?? 0),
    Number(previousSummary.value?.income ?? 0)
  )
)

const expenseChange = computed(() =>
  calculateChange(
    Number(currentSummary.value?.expense ?? 0),
    Number(previousSummary.value?.expense ?? 0)
  )
)

const balanceChange = computed(() =>
  calculateChange(
    Number(currentSummary.value?.balance ?? 0),
    Number(previousSummary.value?.balance ?? 0)
  )
)

const summaryCards = computed(() => [
  {
    key: 'income',
    title: 'Total pemasukan',
    value: formatCurrency(Number(currentSummary.value?.income ?? 0)),
    helper: `${formatSignedPercent(incomeChange.value)} dibanding bulan lalu`,
    helperClass: incomeChange.value >= 0 ? 'text-[#16A34A]' : 'text-[#EF4444]',
    icon: 'heroicons:arrow-trending-up-20-solid',
    iconWrapperClass: 'bg-[#DCFCE7] text-[#16A34A]',
    valueClass: 'text-[#16A34A]'
  },
  {
    key: 'expense',
    title: 'Total pengeluaran',
    value: formatCurrency(Number(currentSummary.value?.expense ?? 0)),
    helper: `${formatSignedPercent(expenseChange.value)} dibanding bulan lalu`,
    helperClass: expenseChange.value <= 0 ? 'text-[#16A34A]' : 'text-[#EF4444]',
    icon: 'heroicons:arrow-trending-down-20-solid',
    iconWrapperClass: 'bg-[#FEE2E2] text-[#EF4444]',
    valueClass: 'text-[#EF4444]'
  },
  {
    key: 'balance',
    title: 'Saldo bersih',
    value: formatCurrency(Number(currentSummary.value?.balance ?? 0)),
    helper: `${formatSignedPercent(balanceChange.value)} dibanding bulan lalu`,
    helperClass: balanceChange.value >= 0 ? 'text-[#16A34A]' : 'text-[#EF4444]',
    icon: 'heroicons:wallet-20-solid',
    iconWrapperClass: 'bg-[#DBEAFE] text-[#2563EB]',
    valueClass: 'text-[#16A34A]'
  }
])

const categoryColorMap: Record<string, string> = {
  Gaji: '#16A34A',
  Bonus: '#22C55E',
  Freelance: '#10B981',
  Penjualan: '#059669',
  Investasi: '#0EA5E9',
  Makan: '#EF4444',
  Transportasi: '#3B82F6',
  Tagihan: '#F59E0B',
  Internet: '#06B6D4',
  Belanja: '#8B5CF6',
  Hiburan: '#EC4899'
}

const fallbackCategoryColors = [
  '#8B5CF6',
  '#EF4444',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EC4899'
]

const categoryBreakdown = computed(() => {
  const grouped = currentMonthExpenseTransactions.value.reduce<
    Record<string, number>
  >((acc, item) => {
    const label = item.category?.categoryname || 'Lainnya'
    acc[label] = (acc[label] || 0) + Number(item.amount)
    return acc
  }, {})

  const totalExpense = Number(currentSummary.value?.expense ?? 0)

  return Object.entries(grouped)
    .map(([label, total], index) => ({
      label,
      total,
      percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
      color:
        categoryColorMap[label] ||
        fallbackCategoryColors[index % fallbackCategoryColors.length] ||
        '#94A3B8'
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
})

const categoryChartSeries = computed(() =>
  categoryBreakdown.value.map(item => Number(item.total.toFixed(2)))
)

const categoryChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif'
  },
  labels: categoryBreakdown.value.map(item => item.label),
  colors: categoryBreakdown.value.map(item => item.color),
  legend: {
    position: 'right',
    horizontalAlign: 'left',
    fontSize: '12px',
    labels: {
      colors: '#475569'
    },
    itemMargin: {
      vertical: 4
    }
  },
  stroke: {
    width: 0
  },
  dataLabels: {
    enabled: true,
    formatter: (value: number) => `${value.toFixed(1)}%`
  },
  tooltip: {
    y: {
      formatter: (value: number) => formatCurrency(value)
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '56%'
      }
    }
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        legend: {
          position: 'bottom'
        }
      }
    }
  ]
}))

const getDaysInMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

const dailySeriesData = computed(() => {
  const baseDate = selectedMonthDate.value
  const daysCount = getDaysInMonth(baseDate)

  const incomeByDay = Array.from({ length: daysCount }, () => 0)
  const expenseByDay = Array.from({ length: daysCount }, () => 0)

  currentMonthTransactions.value.forEach(transaction => {
    const date = new Date(transaction.transactionDate)
    const dayIndex = date.getDate() - 1

    if (dayIndex < 0 || dayIndex >= daysCount) {
      return
    }

    if (transaction.type === 'income') {
      incomeByDay[dayIndex] =
        (incomeByDay[dayIndex] ?? 0) + Number(transaction.amount)
      return
    }

    expenseByDay[dayIndex] =
      (expenseByDay[dayIndex] ?? 0) + Number(transaction.amount)
  })

  return Array.from({ length: daysCount }, (_, index) => ({
    label: `${baseDate.toLocaleDateString('id-ID', { month: 'short' })} ${index + 1}`,
    income: incomeByDay[index] ?? 0,
    expense: expenseByDay[index] ?? 0
  }))
})

const dailyTrendSeries = computed(() => [
  {
    name: 'Pengeluaran',
    data: dailySeriesData.value.map(item => item.expense)
  },
  {
    name: 'Pemasukan',
    data: dailySeriesData.value.map(item => item.income)
  }
])

const dailyTrendOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#64748B'
  },
  colors: ['#EF4444', '#16A34A'],
  stroke: {
    curve: 'smooth',
    width: 3
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.24,
      opacityTo: 0.06,
      stops: [0, 95, 100]
    }
  },
  dataLabels: {
    enabled: false
  },
  grid: {
    borderColor: '#E5E7EB',
    strokeDashArray: 4
  },
  legend: {
    position: 'top',
    horizontalAlign: 'left',
    fontSize: '12px',
    labels: {
      colors: '#64748B'
    }
  },
  xaxis: {
    categories: dailySeriesData.value.map(item => item.label),
    tickAmount: 6,
    labels: {
      rotate: 0,
      style: {
        fontSize: '11px',
        colors: Array.from(
          { length: dailySeriesData.value.length },
          () => '#94A3B8'
        )
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    labels: {
      formatter: (value: number) => formatCompactCurrency(value),
      style: {
        colors: ['#94A3B8'],
        fontSize: '11px'
      }
    }
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (value: number) => formatCurrency(value)
    }
  }
}))

const merchantVisualMap: Record<string, MerchantVisual> = {
  Gaji: {
    icon: 'heroicons:building-library-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Bonus: {
    icon: 'heroicons:gift-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Freelance: {
    icon: 'heroicons:briefcase-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Penjualan: {
    icon: 'heroicons:shopping-cart-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Investasi: {
    icon: 'heroicons:chart-bar-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Makan: {
    icon: 'lucide:utensils-crossed',
    wrapperClass: 'bg-[#FEE2E2] text-[#EF4444]'
  },
  Transportasi: {
    icon: 'heroicons:truck-20-solid',
    wrapperClass: 'bg-[#DBEAFE] text-[#2563EB]'
  },
  Tagihan: {
    icon: 'heroicons:home-20-solid',
    wrapperClass: 'bg-[#FEF3C7] text-[#D97706]'
  },
  Internet: {
    icon: 'heroicons:wifi-20-solid',
    wrapperClass: 'bg-[#E0F2FE] text-[#0284C7]'
  },
  Belanja: {
    icon: 'heroicons:shopping-bag-20-solid',
    wrapperClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  Hiburan: {
    icon: 'heroicons:film-20-solid',
    wrapperClass: 'bg-[#F3E8FF] text-[#9333EA]'
  }
}

const getMerchantVisual = (transaction: TransactionItem): MerchantVisual => {
  const categoryName = transaction.category?.categoryname || ''

  return (
    merchantVisualMap[categoryName] || {
      icon:
        transaction.type === 'income'
          ? 'heroicons:banknotes-20-solid'
          : 'heroicons:credit-card-20-solid',
      wrapperClass:
        transaction.type === 'income'
          ? 'bg-[#DCFCE7] text-[#16A34A]'
          : 'bg-[#EEF2F7] text-[#64748B]'
    }
  )
}

const getMerchantLabel = (transaction: TransactionItem) => {
  const note = (transaction.note || '').trim()
  const firstLine = note.split('\n')[0]?.trim()

  if (firstLine) {
    return firstLine
  }

  return transaction.category?.categoryname?.trim() || 'Transaksi'
}

const topMerchants = computed(() => {
  const grouped = currentMonthExpenseTransactions.value.reduce<
    Record<
      string,
      {
        label: string
        total: number
        count: number
        visual: MerchantVisual
      }
    >
  >((acc, transaction) => {
    const label = getMerchantLabel(transaction)

    let currentMerchant = acc[label]

    if (!currentMerchant) {
      currentMerchant = {
        label,
        total: 0,
        count: 0,
        visual: getMerchantVisual(transaction)
      }
      acc[label] = currentMerchant
    }

    currentMerchant.total += Number(transaction.amount)
    currentMerchant.count += 1

    return acc
  }, {})

  const totalExpense = Number(currentSummary.value?.expense ?? 0)

  return Object.values(grouped)
    .map(item => ({
      ...item,
      percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
})

const isPageLoading = computed(
  () => isSummaryPending.value || isTransactionsPending.value
)
</script>

<template>
  <section class="space-y-6">
    <div
      class="rounded-[20px] border border-[#E7EDF4] bg-white px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-5 py-3 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center px-2">
        <div class="flex items-center text-[13px] font-semibold text-[#0F172A]">
          Pilih bulan:
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D7DEE8] bg-white text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canGoToOlderMonth"
            @click="goToOlderMonth"
          >
            <ChevronLeft class="h-4 w-4" />
          </button>

          <select
            v-model="selectedMonth"
            class="h-10 min-w-[190px] rounded-[10px] border border-[#D7DEE8] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition focus:border-[#18B66A] cursor-pointer"
          >
            <option
              v-for="month in monthOptions"
              :key="month.value"
              :value="month.value"
            >
              {{ month.label }}
            </option>
          </select>

          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D7DEE8] bg-white text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canGoToNewerMonth"
            @click="goToNewerMonth"
          >
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>

      <div class="flex flex-row gap-3 sm:justify-start lg:justify-end">
        <div class="group relative sm:flex-none">
          <button
            type="button"
            disabled
            class="inline-flex h-11 w-full sm:w-auto cursor-not-allowed items-center justify-center gap-2 rounded-[12px] border border-[#D7DEE8] bg-white px-4 text-[14px] font-semibold text-[#334155] opacity-70"
          >
            <FileSpreadsheet class="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <div
            class="pointer-events-none absolute right-0 top-[calc(100%+8px)] z-10 hidden w-[220px] rounded-[12px] bg-[#0F172A] px-3 py-2 text-[12px] text-white shadow-lg group-hover:block"
          >
            Export CSV akan menyusul di versi berikutnya.
          </div>
        </div>

        <div class="group relative sm:flex-none">
          <button
            type="button"
            disabled
            class="inline-flex h-11 w-full sm:w-auto cursor-not-allowed items-center justify-center gap-2 rounded-[12px] bg-[#18B66A] px-4 text-[14px] font-semibold text-white opacity-70"
          >
            <FileText class="h-4 w-4" />
            <span>Export PDF</span>
          </button>

          <div
            class="pointer-events-none absolute right-0 top-[calc(100%+8px)] z-10 hidden w-[220px] rounded-[12px] bg-[#0F172A] px-3 py-2 text-[12px] text-white shadow-lg group-hover:block"
          >
            Export PDF akan menyusul di versi berikutnya.
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <article
        v-for="card in summaryCards"
        :key="card.key"
        class="rounded-[18px] border border-[#E9EEF5] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[13px] font-medium text-[#64748B]">
              {{ card.title }}
            </p>

            <div
              v-if="isSummaryPending"
              class="mt-2 h-8 w-32 animate-pulse rounded-md bg-[#EEF2F7]"
            />

            <p
              v-else
              class="mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em]"
              :class="card.valueClass"
            >
              {{ card.value }}
            </p>

            <p class="mt-3 text-[12px] font-medium" :class="card.helperClass">
              {{ card.helper }}
            </p>
          </div>

          <div
            class="flex h-10 w-10 items-center justify-center rounded-[12px]"
            :class="card.iconWrapperClass"
          >
            <Icon :name="card.icon" class="h-5 w-5" />
          </div>
        </div>
      </article>
    </div>

    <article
      class="rounded-[20px] border border-[#E7EDF4] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6"
    >
      <div class="mb-4">
        <h2 class="text-[18px] font-semibold text-[#0F172A]">
          Tren harian pemasukan & pengeluaran
        </h2>
        <p class="mt-1 text-[14px] text-[#64748B]">
          Pantau pergerakan transaksi harian agar pola bulan ini lebih mudah
          dibaca.
        </p>
      </div>

      <div
        v-if="isPageLoading"
        class="h-[320px] animate-pulse rounded-[16px] bg-[#F8FAFC]"
      />

      <div
        v-else-if="currentMonthTransactions.length > 0"
        class="min-h-[320px]"
      >
        <ClientOnly>
          <apexchart
            type="area"
            height="320"
            :options="dailyTrendOptions"
            :series="dailyTrendSeries"
          />
        </ClientOnly>
      </div>

      <div
        v-else
        class="flex min-h-[320px] items-center justify-center text-center"
      >
        <div>
          <p class="text-[16px] font-semibold text-[#0F172A]">
            Belum ada transaksi di bulan ini
          </p>
          <p class="mt-2 text-[14px] text-[#64748B]">
            Setelah ada transaksi, tren harian pemasukan dan pengeluaran akan
            terlihat di sini.
          </p>
        </div>
      </div>
    </article>

    <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
      <article
        class="rounded-[20px] border border-[#E7EDF4] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <div class="mb-4">
          <h2 class="text-[18px] font-semibold text-[#0F172A]">
            Kategori pengeluaran
          </h2>
          <p class="mt-1 text-[14px] text-[#64748B]">
            Lihat kategori mana yang paling banyak menyerap pengeluaran bulan
            ini.
          </p>
        </div>

        <div
          v-if="isPageLoading"
          class="h-[320px] animate-pulse rounded-[16px] bg-[#F8FAFC]"
        />

        <div v-else-if="categoryBreakdown.length > 0" class="min-h-[320px]">
          <ClientOnly>
            <apexchart
              type="donut"
              height="320"
              :options="categoryChartOptions"
              :series="categoryChartSeries"
            />
          </ClientOnly>
        </div>

        <div
          v-else
          class="flex min-h-[320px] items-center justify-center text-center"
        >
          <div>
            <p class="text-[16px] font-semibold text-[#0F172A]">
              Belum ada pengeluaran bulan ini
            </p>
            <p class="mt-2 text-[14px] text-[#64748B]">
              Saat pengeluaran mulai tercatat, distribusi kategorinya akan
              muncul di sini.
            </p>
          </div>
        </div>
      </article>

      <article
        class="rounded-[20px] border border-[#E7EDF4] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6"
      >
        <div class="mb-4">
          <h2 class="text-[18px] font-semibold text-[#0F172A]">
            Merchant teratas
          </h2>
          <p class="mt-1 text-[14px] text-[#64748B]">
            Ringkasan merchant atau deskripsi yang paling banyak menyumbang
            pengeluaran bulan ini.
          </p>
        </div>

        <div v-if="isPageLoading" class="space-y-3">
          <div
            v-for="index in 5"
            :key="index"
            class="h-[74px] animate-pulse rounded-[14px] bg-[#F8FAFC]"
          />
        </div>

        <div v-else-if="topMerchants.length > 0" class="space-y-3">
          <div
            v-for="merchant in topMerchants"
            :key="merchant.label"
            class="flex flex-col gap-4 rounded-[14px] border border-[#EEF2F7] px-4 py-4 sm:flex-row sm:items-center justify-between"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
                :class="merchant.visual.wrapperClass"
              >
                <Icon :name="merchant.visual.icon" class="h-5 w-5" />
              </div>

              <div class="min-w-0">
                <p class="truncate text-[14px] font-semibold text-[#0F172A]">
                  {{ merchant.label }}
                </p>
                <p class="mt-1 text-[12px] text-[#94A3B8]">
                  {{ merchant.count }} transaksi
                </p>
              </div>
            </div>
            <div class="text-left sm:text-right">
              <p class="text-[14px] font-semibold text-[#0F172A]">
                {{ formatCurrency(merchant.total) }}
              </p>
              <p class="mt-1 text-[12px] text-[#94A3B8]">
                {{ formatPercent(merchant.percentage) }} dari pengeluaran
              </p>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex min-h-[220px] items-center justify-center text-center"
        >
          <div>
            <p class="text-[16px] font-semibold text-[#0F172A]">
              Belum ada merchant yang bisa dirangkum
            </p>
            <p class="mt-2 text-[14px] text-[#64748B]">
              Saat transaksi pengeluaran mulai bertambah, daftar ringkasnya akan
              muncul di sini.
            </p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
