<script setup lang="ts">
definePageMeta({
  layout: false
})
</script>

<template>
  <section
    class="flex min-h-screen items-center justify-center bg-[#f5f7f9] px-4 py-8"
  >
    <div class="w-full max-w-md">
      <ClientOnly>
        <SignIn
          routing="path"
          path="/auth/login"
          sign-up-url="/auth/register"
          fallback-redirect-url="/auth/sync"
          force-redirect-url="/auth/sync"
        />

        <template #fallback>
          <p class="text-center text-sm text-[#64748b]">Memuat form login...</p>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>
