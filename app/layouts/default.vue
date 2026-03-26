<script setup lang="ts">
import AppSidebar from '~/components/dashboard/AppSidebar.vue'
import AppHeader from '~/components/dashboard/AppHeader.vue'

const route = useRoute()

const { data: user, isPending } = useMeQuery()

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
  <div class="min-h-screen bg-[#F6F8FB] text-[#0F172A]">
    <div class="flex">
      <AppSidebar
        :user="user"
        :is-pending="isPending"
      />

      <div class="min-w-0 flex-1">
        <AppHeader
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
                class="inline-flex h-12 items-center gap-2 rounded-[12px] bg-[#18B66A] px-5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#14a45f]"
              >
                <span class="text-[18px] leading-none">+</span>
                <span>{{ headerActionLabel }}</span>
              </NuxtLink>
            </slot>
          </template>
        </AppHeader>

        <main class="px-8 pb-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
