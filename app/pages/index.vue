<script setup lang="ts">
import { computed } from 'vue'
import type { ApexOptions } from 'apexcharts'
import { useDashboard } from '~/composables/useDashboard'

import type { TransactionItem } from '~/composables/useTransactions'

definePageMeta({
  headerActionLabel: 'Tambah Transaksi',
  headerActionTo: '/transactions/create'
})

const {
  selectedRangeMonths,
  savingsGoalPercent,
  recentTransactions,
  // totalTransactions,
  currentMonthTransactions,
  currentSummary,
  previousSummary,
  savingsRate,
  dashboardSection,
  categoryBreakdown,
  monthlyTrendLabels,
  monthlyTrendSeries,
  isStatsLoading,
  isInsightLoading
} = useDashboard()

const rangeOptions = [
  { label: '3 bulan terakhir', value: 3 },
  { label: '6 bulan terakhir', value: 6 },
  { label: '12 bulan terakhir', value: 12 }
]

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

const formatCurrency = (value: number) => currencyFormatter.format(value)

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

const incomeChange = computed(() =>
  calculateChange(currentSummary.value.income, previousSummary.value.income)
)

const expenseChange = computed(() =>
  calculateChange(currentSummary.value.expense, previousSummary.value.expense)
)

const balanceChange = computed(() =>
  calculateChange(currentSummary.value.balance, previousSummary.value.balance)
)

const summaryCards = computed(() => [
  {
    key: 'income',
    title: 'Total pemasukan',
    value: formatCurrency(currentSummary.value.income),
    helper: 'Bulan ini',
    badge: formatSignedPercent(incomeChange.value),
    badgeTone: incomeChange.value >= 0 ? 'success' : 'danger',
    icon: 'heroicons:arrow-trending-up-20-solid',
    iconWrapperClass: 'bg-[#DCFCE7] text-[#16A34A]'
  },
  {
    key: 'expense',
    title: 'Total pengeluaran',
    value: formatCurrency(currentSummary.value.expense),
    helper: 'Bulan ini',
    badge: formatSignedPercent(expenseChange.value),
    badgeTone: expenseChange.value <= 0 ? 'success' : 'danger',
    icon: 'heroicons:arrow-trending-down-20-solid',
    iconWrapperClass: 'bg-[#FEE2E2] text-[#EF4444]'
  },
  {
    key: 'balance',
    title: 'Saldo bersih',
    value: formatCurrency(currentSummary.value.balance),
    helper: 'Saldo tersedia',
    badge: formatSignedPercent(balanceChange.value),
    badgeTone: balanceChange.value >= 0 ? 'success' : 'danger',
    icon: 'heroicons:wallet-20-solid',
    iconWrapperClass: 'bg-[#DBEAFE] text-[#2563EB]'
  },
  {
    key: 'savings',
    title: 'Tingkat menabung',
    value: formatPercent(savingsRate.value),
    helper: 'Dari pemasukan',
    badge: `Target ${savingsGoalPercent.value}%`,
    badgeTone: savingsRate.value >= savingsGoalPercent.value ? 'success' : 'violet',
    icon: 'heroicons:archive-box-20-solid',
    iconWrapperClass: 'bg-[#F3E8FF] text-[#9333EA]'
  }
])

const badgeClassMap: Record<string, string> = {
  success: 'bg-[#DCFCE7] text-[#16A34A]',
  danger: 'bg-[#FEE2E2] text-[#EF4444]',
  violet: 'bg-[#F3E8FF] text-[#9333EA]',
  neutral: 'bg-[#EEF2F7] text-[#64748B]'
}

const donutColors = ['#8B5CF6', '#EF4444', '#3B82F6', '#10B981', '#F59E0B']

const donutChartSeries = computed(() =>
  categoryBreakdown.value.map(item => Number(item.total.toFixed(2)))
)

const donutChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    toolbar: { show: false },
    fontFamily: 'Poppins, sans-serif'
  },
  labels: categoryBreakdown.value.map(item => item.label),
  legend: {
    show: false
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(0)}%`
  },
  stroke: {
    width: 0
  },
  colors: donutColors,
  tooltip: {
    y: {
      formatter: (value: number) => formatCurrency(value)
    }
  },
  plotOptions: {
    pie: {
      donut: {
        size: '58%'
      }
    }
  }
}))

const areaChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Poppins, sans-serif',
    foreColor: '#64748B'
  },
  colors: ['#F15B5D', '#18B66A'],
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.28,
      opacityTo: 0.08,
      stops: [0, 95, 100]
    }
  },
  grid: {
    borderColor: '#E5E7EB',
    strokeDashArray: 4,
    padding: {
      left: 8,
      right: 8
    }
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'left',
    fontSize: '13px',
    labels: {
      colors: '#64748B'
    },
    markers: {
      size: 12
    }
  },
  xaxis: {
    categories: monthlyTrendLabels.value,
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    },
    labels: {
      style: {
        colors: '#64748B',
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    labels: {
      formatter: (value: number) => formatCompactCurrency(value),
      style: {
        colors: ['#64748B'],
        fontSize: '12px'
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

const normalizeCategoryName = (name?: string | null) => {
  return (name || '').trim()
}

const resolveTransactionVisual = (transaction: TransactionItem): TransactionVisual => {
  const categoryName = normalizeCategoryName(transaction.category?.categoryname)
  const matchedVisual = CATEGORY_VISUAL_MAP[categoryName]

  if (matchedVisual) {
    return matchedVisual
  }

  return transaction.type === 'income'
    ? DEFAULT_INCOME_VISUAL
    : DEFAULT_EXPENSE_VISUAL
}

const formatTransactionDate = (value: string) => {
  const date = new Date(value)
  const now = new Date()

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  const timeLabel = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })

  if (isToday) {
    return `Hari ini, ${timeLabel}`
  }

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  }) + `, ${timeLabel}`
}
</script>

<template>
  <section class="space-y-6">
    <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in summaryCards"
        :key="card.key"
        class="rounded-[18px] border border-[#E9EEF5] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <div class="mb-5 flex items-start justify-between gap-4">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-[12px]"
            :class="card.iconWrapperClass"
          >
            <Icon
              :name="card.icon"
              class="h-5 w-5"
            />
          </div>

          <span
            class="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium"
            :class="badgeClassMap[card.badgeTone] || badgeClassMap.neutral"
          >
            {{ card.badge }}
          </span>
        </div>

        <p class="text-[13px] font-medium text-[#64748B]">
          {{ card.title }}
        </p>

        <div
          v-if="isStatsLoading"
          class="mt-2 h-8 w-32 animate-pulse rounded-md bg-[#EEF2F7]"
        />

        <p
          v-else
          class="mt-2 text-[30px] font-semibold leading-none tracking-[-0.03em] text-[#0F172A]"
        >
          {{ card.value }}
        </p>

        <p class="mt-3 text-[12px] text-[#94A3B8]">
          {{ card.helper }}
        </p>
      </article>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_340px]">
      <article
        class="rounded-[20px] border border-[#E9EEF5] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <template v-if="dashboardSection === 'empty-overview'">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                Gambaran keuanganmu
              </h2>
              <p class="mt-2 text-[14px] leading-6 text-[#64748B]">
                Tambahkan transaksi pertamamu untuk mulai melihat insight pengeluaran.
              </p>
            </div>
          </div>

          <div class="flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
            <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF3] text-[#18B66A]">
              <Icon
                name="heroicons:sparkles-20-solid"
                class="h-10 w-10"
              />
            </div>

            <h3 class="mt-6 text-[24px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              Dashboard akan makin hidup setelah ada transaksi
            </h3>

            <p class="mt-3 max-w-[420px] text-[14px] leading-6 text-[#64748B]">
              Saat ini ada {{ currentMonthTransactions.length }} transaksi di bulan ini.
              Begitu transaksi mulai bertambah, kamu akan langsung melihat pola pengeluaran dan pemasukanmu.
            </p>

            <NuxtLink
              to="/transactions/create"
              class="mt-6 inline-flex h-11 items-center gap-2 rounded-[12px] bg-[#18B66A] px-5 text-[14px] font-semibold text-white transition hover:bg-[#14a45f]"
            >
              <Icon
                name="heroicons:plus-20-solid"
                class="h-4 w-4"
              />
              <span>Tambah transaksi pertama</span>
            </NuxtLink>
          </div>
        </template>

        <template v-else-if="dashboardSection === 'spending-by-category'">
          <div class="mb-6">
            <h2 class="text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              Pengeluaran per kategori
            </h2>
            <p class="mt-2 text-[14px] leading-6 text-[#64748B]">
              Lihat pos mana yang paling banyak menyerap pengeluaranmu.
            </p>
          </div>

          <div
            v-if="isInsightLoading"
            class="min-h-[340px] animate-pulse rounded-[16px] bg-[#F8FAFC]"
          />

          <div
            v-else-if="categoryBreakdown.length > 0"
            class="grid min-h-[340px] grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
          >
            <ClientOnly>
              <apexchart
                type="donut"
                height="320"
                :options="donutChartOptions"
                :series="donutChartSeries"
              />
            </ClientOnly>

            <div class="space-y-4">
              <div
                v-for="(item, index) in categoryBreakdown"
                :key="item.label"
                class="flex items-center justify-between gap-4 rounded-[14px] border border-[#EEF2F7] px-4 py-3"
              >
                <div class="min-w-0">
                  <div class="flex items-center gap-3">
                    <span
                      class="h-3 w-3 rounded-full"
                      :style="{ backgroundColor: donutColors[index] || '#CBD5E1' }"
                    />
                    <p class="truncate text-[14px] font-semibold text-[#0F172A]">
                      {{ item.label }}
                    </p>
                  </div>

                  <p class="mt-1 text-[12px] text-[#94A3B8]">
                    {{ formatPercent(item.percentage) }} dari total pengeluaran
                  </p>
                </div>

                <p class="text-right text-[14px] font-semibold text-[#0F172A]">
                  {{ formatCurrency(item.total) }}
                </p>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex min-h-[340px] items-center justify-center text-center"
          >
            <div>
              <p class="text-[16px] font-medium text-[#0F172A]">
                Belum ada pengeluaran yang bisa ditampilkan
              </p>
              <p class="mt-2 text-[14px] text-[#64748B]">
                Coba tambahkan transaksi pengeluaran terlebih dahulu.
              </p>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 class="text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                Tren bulanan
              </h2>
              <p class="mt-2 text-[14px] leading-6 text-[#64748B]">
                Ringkasan pemasukan dan pengeluaran dari beberapa bulan terakhir.
              </p>
            </div>

            <div class="shrink-0">
              <select
                v-model.number="selectedRangeMonths"
                class="h-11 rounded-[12px] border border-[#D7DEE8] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition focus:border-[#18B66A]"
              >
                <option
                  v-for="option in rangeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <div
            v-if="isInsightLoading"
            class="min-h-[340px] animate-pulse rounded-[16px] bg-[#F8FAFC]"
          />

          <div
            v-else
            class="min-h-[340px]"
          >
            <ClientOnly>
              <apexchart
                type="area"
                height="340"
                :options="areaChartOptions"
                :series="monthlyTrendSeries"
              />
            </ClientOnly>
          </div>
        </template>
      </article>

      <aside
        class="rounded-[20px] border border-[#E9EEF5] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="text-[22px] font-semibold tracking-[-0.02em] text-[#0F172A]">
            Transaksi terbaru
          </h2>

          <NuxtLink
            to="/transactions"
            class="text-[13px] font-medium text-[#18B66A] transition hover:text-[#14a45f]"
          >
            Lihat semua
          </NuxtLink>
        </div>

        <div
          v-if="isInsightLoading"
          class="space-y-4"
        >
          <div
            v-for="index in 5"
            :key="index"
            class="h-[62px] animate-pulse rounded-[14px] bg-[#F8FAFC]"
          />
        </div>

        <div
          v-else-if="recentTransactions.length > 0"
          class="space-y-3"
        >
          <div
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            class="flex items-center justify-between gap-4 rounded-[14px] py-2"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
                :class="resolveTransactionVisual(transaction).wrapperClass"
              >
                <Icon
                  :name="resolveTransactionVisual(transaction).icon"
                  class="h-5 w-5"
                />
              </div>

              <div class="min-w-0">
                <p class="truncate text-[14px] font-semibold text-[#0F172A]">
                  {{ transaction.category?.categoryname || transaction.note || 'Transaksi' }}
                </p>
                <p class="mt-1 text-[12px] text-[#94A3B8]">
                  {{ formatTransactionDate(transaction.transactionDate) }}
                </p>
              </div>
            </div>

            <p
              class="shrink-0 text-[14px] font-semibold"
              :class="transaction.type === 'income' ? 'text-[#16A34A]' : 'text-[#EF4444]'"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount).replace('Rp', 'Rp ') }}
            </p>
          </div>
        </div>

        <div
          v-else
          class="flex min-h-[320px] items-center justify-center text-center"
        >
          <div>
            <p class="text-[16px] font-medium text-[#0F172A]">
              Belum ada transaksi terbaru
            </p>
            <p class="mt-2 text-[14px] text-[#64748B]">
              Aktivitasmu akan muncul di sini setelah transaksi mulai ditambahkan.
            </p>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
