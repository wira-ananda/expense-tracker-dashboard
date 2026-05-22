<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ImageUp,
  ReceiptText
} from 'lucide-vue-next'
import {
  useCategoriesQuery,
  useCreateTransactionMutation,
  type TransactionType
} from '~/composables/useTransactions'

definePageMeta({
  hideAppHeader: true,
  middleware: 'clerk-auth'
})

const router = useRouter()

const { data: categories, isPending: isCategoriesPending } =
  useCategoriesQuery()
const createTransactionMutation = useCreateTransactionMutation()

const selectedType = ref<TransactionType>('expense')
const selectedCategoryId = ref('')
const amountDigits = ref('')
const transactionDate = ref(new Date().toISOString().slice(0, 10))
const merchantDescription = ref('')
const selectedAccount = ref('')

const dateInputRef = ref<HTMLInputElement | null>(null)

const accountOptions = [{ value: '', label: 'Pilih akun' }]

const filteredCategories = computed(() =>
  (categories.value ?? []).filter(item => item.type === selectedType.value)
)

watch(
  filteredCategories,
  nextCategories => {
    const isCurrentCategoryStillAvailable = nextCategories.some(
      item => item.id === selectedCategoryId.value
    )

    if (!isCurrentCategoryStillAvailable) {
      selectedCategoryId.value = ''
    }
  },
  { immediate: true }
)

const amountDisplay = computed({
  get() {
    if (!amountDigits.value) return ''
    return new Intl.NumberFormat('id-ID').format(Number(amountDigits.value))
  },
  set(value: string) {
    amountDigits.value = value.replace(/\D/g, '').slice(0, 12)
  }
})

const canSubmit = computed(() => {
  return Number(amountDigits.value) > 0 && !!selectedCategoryId.value
})

const isSubmitting = computed(() => createTransactionMutation.isPending.value)

const handleGoBack = () => {
  router.back()
}

const openDatePicker = () => {
  const input = dateInputRef.value

  if (!input) return

  if (typeof input.showPicker === 'function') {
    input.showPicker()
    return
  }

  input.focus()
}

const buildFinalNote = () => {
  const description = merchantDescription.value.trim()
  return description.length > 0 ? description : null
}

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  try {
    await createTransactionMutation.mutateAsync({
      categoryId: selectedCategoryId.value,
      amount: Number(amountDigits.value),
      note: buildFinalNote(),
      transactionDate: transactionDate.value
    })

    alert('Transaksi berhasil disimpan')
    await navigateTo('/transactions')
  } catch {
    // error sudah ditangani di composable
  }
}
</script>

<template>
  <section class="mx-auto mt-6 w-full pb-8">
    <div class="mb-6 flex justify-between">
      <div class="mt-3">
        <h1
          class="text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#0F172A]"
        >
          Tambah Transaksi
        </h1>
        <p class="mt-2 text-[15px] text-[#64748B]">
          Catat pemasukan atau pengeluaran baru dengan rapi.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex cursor-pointer items-center gap-2 rounded-[10px] px-2 py-1 text-[14px] font-medium text-[#334155] transition hover:bg-[#EEF3F8] hover:text-[#0F172A]"
        @click="handleGoBack"
      >
        <ArrowLeft class="h-6 w-6" />
        <span>Kembali</span>
      </button>
    </div>

    <div
      class="rounded-[20px] border border-[#E7EDF4] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6"
    >
      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label class="mb-2 block text-[13px] font-medium text-[#0F172A]">
              Nominal <span class="text-[#EF4444]">*</span>
            </label>

            <div class="relative">
              <span
                class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium text-[#64748B]"
              >
                Rp
              </span>

              <input
                v-model="amountDisplay"
                type="text"
                inputmode="numeric"
                placeholder="0"
                class="h-12 w-full rounded-[12px] border border-[#D7DEE8] bg-white pl-12 pr-4 text-[14px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#A0AEC0] focus:border-[#18B66A]"
              />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-[13px] font-medium text-[#0F172A]">
              Tipe <span class="text-[#EF4444]">*</span>
            </label>

            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border text-[14px] font-semibold transition"
                :class="
                  selectedType === 'expense'
                    ? 'border-[#F87171] bg-[#FEF2F2] text-[#EF4444]'
                    : 'border-[#D7DEE8] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                "
                @click="selectedType = 'expense'"
              >
                <span>↓</span>
                <span>Pengeluaran</span>
              </button>

              <button
                type="button"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border text-[14px] font-semibold transition"
                :class="
                  selectedType === 'income'
                    ? 'border-[#18B66A] bg-[#ECFDF3] text-[#16A34A]'
                    : 'border-[#D7DEE8] bg-white text-[#334155] hover:bg-[#F8FAFC]'
                "
                @click="selectedType = 'income'"
              >
                <span>↑</span>
                <span>Pemasukan</span>
              </button>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-[13px] font-medium text-[#0F172A]">
              Tanggal <span class="text-[#EF4444]">*</span>
            </label>

            <div class="relative">
              <input
                ref="dateInputRef"
                v-model="transactionDate"
                type="date"
                class="h-12 w-full cursor-pointer rounded-[12px] border border-[#D7DEE8] bg-white px-4 pr-11 text-[14px] font-medium text-[#0F172A] outline-none transition focus:border-[#18B66A]"
                @click="openDatePicker"
              />

              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                aria-label="Pilih tanggal"
                @click="openDatePicker"
              >
                <CalendarDays class="h-4 w-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-[13px] font-medium text-[#0F172A]">
              Kategori <span class="text-[#EF4444]">*</span>
            </label>

            <div class="relative">
              <select
                v-model="selectedCategoryId"
                class="h-12 w-full appearance-none rounded-[12px] border border-[#D7DEE8] bg-white px-4 pr-11 text-[14px] font-medium text-[#0F172A] outline-none transition focus:border-[#18B66A] disabled:bg-[#F8FAFC] disabled:text-[#94A3B8]"
                :disabled="isCategoriesPending"
              >
                <option value="">
                  {{
                    isCategoriesPending
                      ? 'Memuat kategori...'
                      : 'Pilih kategori'
                  }}
                </option>

                <option
                  v-for="category in filteredCategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.categoryname }}
                </option>
              </select>

              <ChevronDown
                class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
              />
            </div>
          </div>

          <div>
            <label class="mb-2 block text-[13px] font-medium text-[#0F172A]">
              Akun
              <span class="text-[#94A3B8]">(opsional)</span>
            </label>

            <div class="relative">
              <select
                v-model="selectedAccount"
                class="h-12 w-full appearance-none rounded-[12px] border border-[#D7DEE8] bg-[#F8FAFC] px-4 pr-11 text-[14px] font-medium text-[#94A3B8] outline-none"
                disabled
              >
                <option
                  v-for="account in accountOptions"
                  :key="account.value"
                  :value="account.value"
                >
                  {{ account.label }}
                </option>
              </select>

              <ChevronDown
                class="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]"
              />
            </div>

            <p class="mt-2 text-[12px] text-[#94A3B8]">
              Pengaturan akun akan menyusul di versi berikutnya.
            </p>
          </div>

          <div>
            <label class="mb-2 block text-[13px] font-medium text-[#0F172A]">
              Merchant / Deskripsi
            </label>

            <input
              v-model="merchantDescription"
              type="text"
              placeholder="Contoh: Starbucks, gaji bulanan, belanja mingguan"
              class="h-12 w-full rounded-[12px] border border-[#D7DEE8] bg-white px-4 text-[14px] font-medium text-[#0F172A] outline-none transition placeholder:text-[#A0AEC0] focus:border-[#18B66A]"
            />
          </div>

          <div class="md:col-span-2">
            <label class="mb-2 block text-[13px] font-medium text-[#0F172A]">
              Bukti transaksi
              <span class="text-[#94A3B8]">(opsional)</span>
            </label>

            <label
              class="flex min-h-[148px] cursor-not-allowed flex-col items-center justify-center rounded-[14px] border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-6 text-center opacity-70"
            >
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                class="hidden"
                disabled
              />

              <div
                class="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#EEF3F8] text-[#94A3B8]"
              >
                <ImageUp class="h-5 w-5" />
              </div>

              <p class="mt-4 text-[14px] font-semibold text-[#64748B]">
                Upload bukti transaksi belum tersedia
              </p>
              <p class="mt-1 text-[12px] text-[#94A3B8]">
                Fitur ini akan hadir di versi berikutnya.
              </p>
            </label>

            <p class="mt-2 text-[12px] text-[#94A3B8]">
              Upload bukti transaksi akan menyusul di versi berikutnya.
            </p>
          </div>
        </div>

        <div
          class="flex flex-col-reverse gap-3 border-t border-[#EEF2F7] pt-5 sm:flex-row"
        >
          <button
            type="button"
            class="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#D7DEE8] bg-white px-5 text-[14px] font-semibold text-[#334155] transition hover:bg-[#F8FAFC]"
            @click="handleGoBack"
          >
            Batal
          </button>

          <button
            type="submit"
            class="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#18B66A] px-5 text-[14px] font-semibold text-white transition hover:bg-[#14a45f] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!canSubmit || isSubmitting"
          >
            <ReceiptText class="h-4 w-4" />
            <span>
              {{ isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
