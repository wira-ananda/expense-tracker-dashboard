<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Menu, X } from 'lucide-vue-next'
import AppSidebar from '~/components/dashboard/AppSidebar.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'
import AppLogo from '~/components/AppLogo.vue'

const route = useRoute()

const { data: user, isPending } = useMeQuery()

const isSidebarOpen = ref(false)

const closeSidebar = () => {
  isSidebarOpen.value = false
}

watch(
  () => route.fullPath,
  () => {
    closeSidebar()
  }
)

const hideAppHeader = computed(() => Boolean(route.meta.hideAppHeader))

const routeTitleMap: Record<string, { title: string; subtitle?: string }> = {
  '/transactions': {
    title: 'Transaksi',
    subtitle: 'Kelola seluruh pemasukan dan pengeluaranmu'
  },
  '/monthly-summary': {
    title: 'Ringkasan Bulanan',
    subtitle: 'Lihat performa keuanganmu per bulan'
  },
  '/profile-settings': {
    title: 'Pengaturan Profil',
    subtitle: 'Atur data akun dan preferensimu'
  }
}

const pageHeader = computed(() => {
  const metaTitle = route.meta.pageTitle as string | undefined
  const metaSubtitle = route.meta.pageSubtitle as string | undefined

  if (route.path === '/') {
    return {
      title: !isPending.value
        ? `Selamat datang kembali, ${user.value?.username || 'Pengguna'}!`
        : 'Loading...',
      subtitle: 'Berikut ringkasan keuanganmu bulan ini'
    }
  }

  if (metaTitle) {
    return {
      title: metaTitle,
      subtitle: metaSubtitle
    }
  }

  const fromMap = routeTitleMap[route.path]
  if (fromMap) {
    return fromMap
  }

  return {
    title: 'Halaman',
    subtitle: ''
  }
})

const headerActionLabel = computed(
  () => (route.meta.headerActionLabel as string | undefined) || ''
)

const headerActionTo = computed(
  () => (route.meta.headerActionTo as string | undefined) || ''
)
</script>

<template>
  <div class="min-h-dvh bg-[#F6F8FB] text-[#0F172A]">
    <div class="lg:flex">
      <!-- Desktop sidebar -->
      <div class="hidden lg:block">
        <AppSidebar
          :user="user"
          :is-pending="isPending"
        />
      </div>

      <div class="min-w-0 flex-1">
        <!-- Mobile topbar -->
        <div
          class="flex h-[72px] items-center justify-between border-b border-[#E8EDF3] bg-white px-4 sm:px-6 lg:hidden"
        >
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[#334155] transition hover:bg-[#F6F8FB]"
            aria-label="Buka menu"
            @click="isSidebarOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>

          <NuxtLink
            to="/"
            class="flex items-center gap-3"
          >
            <AppLogo
              size="h-10 w-10"
              icon-size="h-5 w-5"
            />
            <span class="text-[20px] font-semibold tracking-[-0.02em] text-[#0F172A]">
              ExpenseTracker
            </span>
          </NuxtLink>

          <div class="w-10" />
        </div>

        <!-- Mobile drawer -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="isSidebarOpen"
            class="fixed inset-0 z-50 lg:hidden"
          >
            <div
              class="absolute inset-0 bg-slate-900/35"
              @click="closeSidebar"
            />

            <div class="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white shadow-xl">
              <div class="flex h-[72px] items-center justify-between border-b border-[#E8EDF3] px-4">
                <NuxtLink
                  to="/"
                  class="flex items-center gap-3"
                >
                  <AppLogo
                    size="h-10 w-10"
                    icon-size="h-5 w-5"
                  />
                  <span class="text-[20px] font-semibold tracking-[-0.02em] text-[#0F172A]">
                    ExpenseTracker
                  </span>
                </NuxtLink>

                <button
                  type="button"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[#334155] transition hover:bg-[#F6F8FB]"
                  aria-label="Tutup menu"
                  @click="closeSidebar"
                >
                  <X class="h-5 w-5" />
                </button>
              </div>

              <AppSidebar
                mobile
                :user="user"
                :is-pending="isPending"
              />
            </div>
          </div>
        </Transition>

        <AppHeader
          v-if="!hideAppHeader"
          :title="pageHeader.title"
          :subtitle="pageHeader.subtitle"
          :action-label="headerActionLabel"
          :action-to="headerActionTo"
        >
          <template #right>
            <slot name="header-right">
              <NuxtLink
                v-if="headerActionLabel && headerActionTo"
                :to="headerActionTo"
                class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#18B66A] px-5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#14a45f] sm:w-auto"
              >
                <span class="text-[18px] leading-none">+</span>
                <span>{{ headerActionLabel }}</span>
              </NuxtLink>
            </slot>
          </template>
        </AppHeader>

        <main class="px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
