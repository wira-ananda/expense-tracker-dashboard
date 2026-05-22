<script setup lang="ts">
import { useAuth, useUser } from '@clerk/nuxt/composables'
import { unref } from 'vue'

const config = useRuntimeConfig()
const { isLoaded, isSignedIn, getToken } = useAuth()
const { user } = useUser()

const isSyncing = ref(true)
const errorMessage = ref('')
const hasSynced = ref(false)

async function getClerkToken() {
  const getTokenFn = unref(getToken)

  if (typeof getTokenFn !== 'function') {
    throw new Error('Method getToken Clerk tidak tersedia')
  }

  const token = await getTokenFn()

  if (!token) {
    throw new Error('Token Clerk tidak ditemukan')
  }

  return token
}

async function syncUser() {
  if (hasSynced.value) return
  if (!isLoaded.value) return

  if (!isSignedIn.value) {
    await navigateTo('/auth/login')
    return
  }

  if (!user.value) return

  hasSynced.value = true
  isSyncing.value = true
  errorMessage.value = ''

  try {
    const token = await getClerkToken()

    const email = user.value.primaryEmailAddress?.emailAddress
    const username =
      user.value.username ||
      user.value.fullName ||
      email?.split('@')[0] ||
      'User'

    if (!email) {
      throw new Error('Email Clerk tidak ditemukan')
    }

    await $fetch('/auth/clerk/sync', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        username,
        email
      }
    })

    await navigateTo('/')
  } catch (error) {
    hasSynced.value = false
    errorMessage.value =
      error instanceof Error ? error.message : 'Gagal sinkronisasi'
  } finally {
    isSyncing.value = false
  }
}

watch(
  [isLoaded, isSignedIn, user],
  () => {
    syncUser()
  },
  { immediate: true }
)

function retrySync() {
  hasSynced.value = false
  isSyncing.value = true
  errorMessage.value = ''
  syncUser()
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white"
  >
    <div class="text-center">
      <template v-if="isSyncing">
        <p class="text-lg font-semibold">Menyinkronkan akun...</p>
        <p class="mt-2 text-sm text-slate-400">Mohon tunggu sebentar.</p>
      </template>

      <template v-else-if="errorMessage">
        <p class="text-lg font-semibold">Gagal Sinkronisasi</p>
        <p class="mt-2 text-sm text-red-400">
          {{ errorMessage }}
        </p>

        <button
          class="mt-4 rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950"
          type="button"
          @click="retrySync"
        >
          Coba Lagi
        </button>
      </template>
    </div>
  </div>
</template>
