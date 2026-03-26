<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Search,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import {
  useTransactionsQuery,
  useCategoriesQuery,
  type TransactionItem,
  type TransactionType
} from '~/composables/useTransactions'

definePageMeta({
  pageTitle: 'Transaksi',
  pageSubtitle: 'Kelola dan pantau semua transaksi keuanganmu',
  headerActionLabel: 'Tambah Transaksi',
  headerActionTo: '/transactions/create'
})

const { data: transactions, isPending, isError } = useTransactionsQuery()
const { data: categories } = useCategoriesQuery()

const searchKeyword = ref('')
const selectedType = ref<'all' | TransactionType>('all')
const selectedCategory = ref('all')
const selectedPeriod = ref<
  'this-month' | 'last-30-days' | 'this-year' | 'all-time'
>('this-month')
const selectedSort = ref<
  'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'
>('date-desc')
const currentPage = ref(1)

const ITEMS_PER_PAGE = 6

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
})

const formatCurrency = (value: number) =>
  currencyFormatter.format(value).replace('Rp', 'Rp ')

const periodOptions = [
  { value: 'this-month', label: 'Bulan ini' },
  { value: 'last-30-days', label: '30 hari terakhir' },
  { value: 'this-year', label: 'Tahun ini' },
  { value: 'all-time', label: 'Semua waktu' }
] as const

const typeOptions = [
  { value: 'all', label: 'Semua tipe' },
  { value: 'income', label: 'Pemasukan' },
  { value: 'expense', label: 'Pengeluaran' }
] as const

const sortOptions = [
  { value: 'date-desc', label: 'Tanggal terbaru' },
  { value: 'date-asc', label: 'Tanggal terlama' },
  { value: 'amount-desc', label: 'Nominal terbesar' },
  { value: 'amount-asc', label: 'Nominal terkecil' }
] as const

const categoryOptions = computed(() => [
  { value: 'all', label: 'Semua kategori' },
  ...((categories.value ?? []).map(item => ({
    value: item.id,
    label: item.categoryname
  })))
])

const normalizeText = (value?: string | null) =>
  (value || '').toLowerCase().trim()

const matchesPeriod = (
  dateValue: string,
  period: typeof selectedPeriod.value
) => {
  if (period === 'all-time') return true

  const currentDate = new Date()
  const targetDate = new Date(dateValue)

  if (period === 'this-month') {
    return (
      targetDate.getFullYear() === currentDate.getFullYear() &&
      targetDate.getMonth() === currentDate.getMonth()
    )
  }

  if (period === 'last-30-days') {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(currentDate.getDate() - 30)
    return targetDate >= thirtyDaysAgo && targetDate <= currentDate
  }

  if (period === 'this-year') {
    return targetDate.getFullYear() === currentDate.getFullYear()
  }

  return true
}

const filteredTransactions = computed(() => {
  const allTransactions = transactions.value ?? []
  const keyword = normalizeText(searchKeyword.value)

  return allTransactions.filter((transaction) => {
    const categoryName = normalizeText(transaction.category?.categoryname)
    const note = normalizeText(transaction.note)

    const typeMatches =
      selectedType.value === 'all' || transaction.type === selectedType.value

    const categoryMatches =
      selectedCategory.value === 'all' ||
      transaction.categoryId === selectedCategory.value

    const periodMatches = matchesPeriod(
      transaction.transactionDate,
      selectedPeriod.value
    )

    const keywordMatches =
      keyword.length === 0 ||
      categoryName.includes(keyword) ||
      note.includes(keyword)

    return (
      typeMatches && categoryMatches && periodMatches && keywordMatches
    )
  })
})

const sortedTransactions = computed(() => {
  const items = [...filteredTransactions.value]

  items.sort((a, b) => {
    if (selectedSort.value === 'date-desc') {
      return (
        new Date(b.transactionDate).getTime() -
          new Date(a.transactionDate).getTime()
      )
    }

    if (selectedSort.value === 'date-asc') {
      return (
        new Date(a.transactionDate).getTime() -
          new Date(b.transactionDate).getTime()
      )
    }

    if (selectedSort.value === 'amount-desc') {
      return b.amount - a.amount
    }

    return a.amount - b.amount
  })

  return items
})

const totalItems = computed(() => sortedTransactions.value.length)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / ITEMS_PER_PAGE))
)

const paginatedTransactions = computed(() => {
  const startIndex = (currentPage.value - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  return sortedTransactions.value.slice(startIndex, endIndex)
})

const visiblePages = computed(() => {
  const pages: (number | 'ellipsis')[] = []
  const total = totalPages.value
  const page = currentPage.value

  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  pages.push(1)

  if (page > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, page - 1)
  const end = Math.min(total - 1, page + 1)

  for (let value = start; value <= end; value += 1) {
    pages.push(value)
  }

  if (page < total - 2) {
    pages.push('ellipsis')
  }

  pages.push(total)

  return pages
})

const goToPage = (page: number) => {
  currentPage.value = page
}

const resetToFirstPage = () => {
  currentPage.value = 1
}

watch(
  [
    searchKeyword,
    selectedType,
    selectedCategory,
    selectedPeriod,
    selectedSort
  ],
  resetToFirstPage
)

watch(totalPages, (nextTotalPages) => {
  if (currentPage.value > nextTotalPages) {
    currentPage.value = nextTotalPages
  }
})

const resolveTransactionVisual = (
  transaction: TransactionItem
): TransactionVisual => {
  const categoryName = (transaction.category?.categoryname || '').trim()
  const matched = CATEGORY_VISUAL_MAP[categoryName]

  if (matched) {
    return matched
  }

  return transaction.type === 'income'
    ? DEFAULT_INCOME_VISUAL
    : DEFAULT_EXPENSE_VISUAL
}

const getTransactionTitle = (transaction: TransactionItem) => {
  const note = (transaction.note || '').trim()
  if (note.length > 0) return note
  return transaction.category?.categoryname || 'Transaksi'
}

const formatTableDate = (value: string) =>
  new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

const formatShortDateTime = (value: string) =>
  new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short'
  }) +
  ', ' +
  new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })

const tableRows = computed(() =>
  paginatedTransactions.value.map(transaction => ({
    ...transaction,
    visual: resolveTransactionVisual(transaction),
    title: getTransactionTitle(transaction),
    paymentLabel: 'Belum diatur'
  }))
)
</script>

<template>
  <section class="space-y-6">
    <div
      class="rounded-[20px] border border-[#E7EDF4] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-5"
    >
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="relative lg:min-w-0 lg:flex-1">
          <Search
            class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
          />
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="Cari transaksi..."
            class="h-12 w-full rounded-[10px] border border-[#D7DEE8] bg-white pl-11 pr-4 text-[14px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#A0AEC0] focus:border-[#18B66A] px-8"
          >
        </div>

        <div class="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <select
            v-model="selectedType"
            class="h-12 w-full rounded-[10px] border border-[#D7DEE8] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition focus:border-[#18B66A] sm:w-[190px]"
          >
            <option
              v-for="option in typeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <select
            v-model="selectedCategory"
            class="h-12 w-full rounded-[10px] border border-[#D7DEE8] bg-white px-4 text-[13px] font-medium text-[#0F172A] outline-none transition focus:border-[#18B66A] sm:w-[200px]"
          >
            <option
              v-for="option in categoryOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <select
            v-model="selectedPeriod"
            class="h-12 w-full rounded-[10px] border border-[#D7DEE8] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition focus:border-[#18B66A] sm:w-[180px]"
          >
            <option
              v-for="option in periodOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <article
      class="overflow-hidden rounded-[20px] border border-[#E7EDF4] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div
        class="flex flex-col gap-4 border-b border-[#EEF2F7] px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h2 class="text-[18px] font-semibold text-[#0F172A]">
            Semua transaksi
          </h2>
          <p class="mt-1 text-[14px] text-[#64748B]">
            Lihat dan rapikan seluruh pemasukan serta pengeluaranmu di satu tempat.
          </p>
        </div>

        <div class="flex items-center gap-3 self-start lg:self-auto">
          <span class="text-[14px] text-[#64748B]">Urutkan:</span>

          <select
            v-model="selectedSort"
            class="h-10 min-w-[180px] rounded-[10px] border border-[#D7DEE8] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition focus:border-[#18B66A]"
          >
            <option
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="isPending"
        class="space-y-3 p-4 sm:p-6"
      >
        <div
          v-for="index in 6"
          :key="index"
          class="h-[68px] animate-pulse rounded-[14px] bg-[#F8FAFC]"
        />
      </div>

      <div
        v-else-if="isError"
        class="flex min-h-[320px] items-center justify-center px-6 text-center"
      >
        <div>
          <p class="text-[18px] font-semibold text-[#0F172A]">
            Transaksi belum bisa dimuat
          </p>
          <p class="mt-2 text-[14px] text-[#64748B]">
            Coba refresh halaman atau cek lagi koneksi API-mu.
          </p>
        </div>
      </div>

      <div
        v-else-if="tableRows.length === 0"
        class="flex min-h-[320px] items-center justify-center px-6 text-center"
      >
        <div>
          <p class="text-[18px] font-semibold text-[#0F172A]">
            Belum ada transaksi yang cocok
          </p>
          <p class="mt-2 text-[14px] text-[#64748B]">
            Ubah filter atau tambahkan transaksi baru agar daftar ini mulai terisi.
          </p>
        </div>
      </div>

      <template v-else>
        <div class="hidden overflow-x-auto lg:block">
          <table class="min-w-[980px] w-full table-fixed">
            <thead>
              <tr class="border-b border-[#EEF2F7] bg-[#F8FAFC]">
                <th
                  class="w-[140px] px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]"
                >
                  Tanggal
                </th>
                <th
                  class="w-[300px] px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]"
                >
                  Deskripsi
                </th>
                <th
                  class="w-[170px] px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]"
                >
                  Kategori
                </th>
                <th
                  class="w-[130px] px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]"
                >
                  Metode pembayaran
                </th>
                <th
                  class="w-[200px] px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]"
                >
                  Nominal
                </th>
                <th
                  class="w-[100px] px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]"
                >
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="row in tableRows"
                :key="row.id"
                class="border-b border-[#EEF2F7] transition hover:bg-[#FCFDFD] last:border-b-0"
              >
                <td class="px-5 py-4 text-[14px] font-medium text-[#0F172A]">
                  {{ formatTableDate(row.transactionDate) }}
                </td>

                <td class="px-5 py-4">
                  <div class="flex min-w-0 items-center gap-3">
                    <div
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
                      :class="row.visual.wrapperClass"
                    >
                      <Icon
                        :name="row.visual.icon"
                        class="h-4 w-4"
                      />
                    </div>

                    <p class="truncate text-[14px] font-semibold text-[#0F172A]">
                      {{ row.title }}
                    </p>
                  </div>
                </td>

                <td class="px-5 py-4">
                  <span
                    class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium"
                    :class="row.visual.badgeClass"
                  >
                    {{ row.category?.categoryname || 'Tanpa kategori' }}
                  </span>
                </td>

                <td class="px-5 py-4 text-[14px] text-[#64748B]">
                  {{ row.paymentLabel }}
                </td>

                <td
                  class="px-5 py-4 text-right text-[14px] font-semibold"
                  :class="row.type === 'income' ? 'text-[#16A34A]' : 'text-[#EF4444]'"
                >
                  {{ row.type === 'income' ? '+' : '-' }}{{ formatCurrency(row.amount) }}
                </td>

                <td class="px-5 py-4">
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      disabled
                      class="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-[8px] text-[#94A3B8] opacity-60"
                      aria-label="Lihat detail"
                    >
                      <Eye class="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled
                      class="inline-flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-[8px] text-[#94A3B8] opacity-60"
                      aria-label="Edit transaksi"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="space-y-3 p-4 lg:hidden sm:p-6">
          <article
            v-for="row in tableRows"
            :key="row.id"
            class="rounded-[16px] border border-[#EEF2F7] p-4"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex min-w-0 items-start gap-3">
                <div
                  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
                  :class="row.visual.wrapperClass"
                >
                  <Icon
                    :name="row.visual.icon"
                    class="h-5 w-5"
                  />
                </div>

                <div class="min-w-0">
                  <p class="truncate text-[15px] font-semibold text-[#0F172A]">
                    {{ row.title }}
                  </p>
                  <p class="mt-1 text-[12px] text-[#94A3B8]">
                    {{ formatShortDateTime(row.transactionDate) }}
                  </p>
                </div>
              </div>

              <p
                class="shrink-0 text-right text-[14px] font-semibold"
                :class="row.type === 'income' ? 'text-[#16A34A]' : 'text-[#EF4444]'"
              >
                {{ row.type === 'income' ? '+' : '-' }}{{ formatCurrency(row.amount) }}
              </p>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span
                class="inline-flex rounded-full px-3 py-1 text-[12px] font-medium"
                :class="row.visual.badgeClass"
              >
                {{ row.category?.categoryname || 'Tanpa kategori' }}
              </span>

              <span
                class="inline-flex rounded-full bg-[#EEF2F7] px-3 py-1 text-[12px] font-medium text-[#64748B]"
              >
                {{ row.type === 'income' ? 'Pemasukan' : 'Pengeluaran' }}
              </span>

              <span
                class="inline-flex rounded-full bg-[#EEF2F7] px-3 py-1 text-[12px] font-medium text-[#64748B]"
              >
                {{ row.paymentLabel }}
              </span>
            </div>

            <div class="mt-4 flex items-center gap-2">
              <button
                type="button"
                disabled
                class="inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-[10px] border border-[#E2E8F0] text-[#94A3B8] opacity-60"
                aria-label="Lihat detail"
              >
                <Eye class="h-4 w-4" />
              </button>

              <button
                type="button"
                disabled
                class="inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-[10px] border border-[#E2E8F0] text-[#94A3B8] opacity-60"
                aria-label="Edit transaksi"
              >
                <Pencil class="h-4 w-4" />
              </button>
            </div>
          </article>
        </div>

        <div
          class="flex flex-col gap-4 border-t border-[#EEF2F7] px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <p class="text-[14px] text-[#64748B]">
            Menampilkan
            <span class="font-semibold text-[#0F172A]">
              {{ totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1 }}
            </span>
            sampai
            <span class="font-semibold text-[#0F172A]">
              {{ Math.min(currentPage * ITEMS_PER_PAGE, totalItems) }}
            </span>
            dari
            <span class="font-semibold text-[#0F172A]">{{ totalItems }}</span>
            transaksi
          </p>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#D7DEE8] bg-white px-3 text-[13px] font-medium text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <ChevronLeft class="h-4 w-4" />
              <span>Sebelumnya</span>
            </button>

            <template
              v-for="page in visiblePages"
              :key="`${page}`"
            >
              <span
                v-if="page === 'ellipsis'"
                class="px-1 text-[13px] text-[#94A3B8]"
              >
                ...
              </span>

              <button
                v-else
                type="button"
                class="inline-flex h-8 min-w-[32px] items-center justify-center rounded-[8px] border px-2.5 text-[13px] font-medium transition"
                :class="
                  currentPage === page
                    ? 'border-[#18B66A] bg-[#18B66A] text-white'
                    : 'border-[#D7DEE8] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                "
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </template>

            <button
              type="button"
              class="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#D7DEE8] bg-white px-3 text-[13px] font-medium text-[#334155] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <span>Berikutnya</span>
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </template>
    </article>
  </section>
</template>
