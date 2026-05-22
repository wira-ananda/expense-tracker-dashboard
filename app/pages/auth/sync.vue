<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <ClientOnly>
    <AuthSyncClient />

    <template #fallback>
      <div
        class="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white"
      >
        <div class="text-center">
          <p class="text-lg font-semibold">Menyinkronkan akun...</p>
          <p class="mt-2 text-sm text-slate-400">Mohon tunggu sebentar.</p>
        </div>
      </div>
    </template>
  </ClientOnly>
</template>
