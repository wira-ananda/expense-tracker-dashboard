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
        <SignUp
          routing="path"
          path="/auth/register"
          sign-in-url="/auth/login"
          fallback-redirect-url="/auth/sync"
          force-redirect-url="/auth/sync"
        />

        <template #fallback>
          <p class="text-center text-sm text-[#64748b]">
            Memuat form register...
          </p>
        </template>
      </ClientOnly>
    </div>
  </section>
</template>
