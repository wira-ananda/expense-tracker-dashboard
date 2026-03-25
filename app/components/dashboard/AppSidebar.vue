<script setup lang="ts">
import {
  LayoutDashboard,
  ReceiptText,
  CalendarDays,
  Settings,
  LogOut,
  Wallet
} from 'lucide-vue-next'
import AppLogo from '../AppLogo.vue'

const { logout } = useLogout()

const route = useRoute()

const authUser = useState('auth_user', () => ({
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  avatar: ''
}))

const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
    match: (path: string) => path === '/'
  },
  {
    label: 'Transaksi',
    to: '/transactions',
    icon: ReceiptText,
    match: (path: string) => path.startsWith('/transactions')
  },
  {
    label: 'Ringkasan Bulanan',
    to: '/monthly-summary',
    icon: CalendarDays,
    match: (path: string) => path.startsWith('/monthly-summary')
  },
  {
    label: 'Pengaturan Profil',
    to: '/profile-settings',
    icon: Settings,
    match: (path: string) => path.startsWith('/profile-settings')
  }
]

const isActive = (item: (typeof navItems)[number]) => item.match(route.path)

const initials = computed(() => {
  const name = authUser.value?.name || 'User'
  return name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const handleLogout = () => {
  // isi logout-mu di sini
  console.log('logout')
}
</script>

<template>
  <aside
    class="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-[#E8EDF3] bg-white"
  >
    <div class="flex h-[78px] items-center border-b border-[#E8EDF3] px-5">
      <NuxtLink
        to="/"
        class="flex items-center gap-3"
      >
        <AppLogo />

        <span class="text-[18px] font-semibold tracking-[-0.02em] text-[#0F172A]">
          ExpenseTracker
        </span>
      </NuxtLink>
    </div>

    <div class="flex-1 px-4 py-5">
      <nav class="space-y-2">
        <NuxtLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="flex h-11 items-center gap-3 rounded-[10px] px-4 text-[14px] font-medium transition-colors"
          :class="
            isActive(item)
              ? 'bg-[#DDF7E8] text-[#17A966]'
              : 'text-[#334155] hover:bg-[#F6F8FB] hover:text-[#0F172A]'
          "
        >
          <component
            :is="item.icon"
            class="h-[16px] w-[16px]"
          />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="border-t border-[#E8EDF3] p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E2E8F0] text-[12px] font-semibold text-[#334155]"
          >
            <img
              v-if="authUser.avatar"
              :src="authUser.avatar"
              :alt="authUser.name"
              class="h-full w-full object-cover"
            >
            <span v-else>{{ initials }}</span>
          </div>

          <div class="min-w-0">
            <p class="truncate text-[14px] font-semibold text-[#0F172A]">
              {{ authUser.name }}
            </p>
            <p class="truncate text-[12px] text-[#94A3B8]">
              {{ authUser.email }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-[#F6F8FB] hover:text-[#0F172A] cursor-pointer"
          aria-label="Keluar"
          @click="logout"
        >
          <LogOut class="h-4 w-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
