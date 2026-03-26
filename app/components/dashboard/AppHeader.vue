<script setup lang="ts">
type Props = {
  title: string
  subtitle?: string
  actionLabel?: string
  actionTo?: string
}

defineProps<Props>()
</script>

<template>
  <header
    class="flex flex-col gap-4 px-4 pb-5 pt-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8 lg:pb-6 lg:pt-8"
  >
    <div class="min-w-0">
      <h1
        class="text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#0F172A] sm:text-[34px] lg:text-[30px]"
      >
        {{ title }}
      </h1>

      <p
        v-if="subtitle"
        class="mt-2 max-w-[680px] text-[14px] font-normal leading-6 text-[#64748B] sm:text-[15px]"
      >
        {{ subtitle }}
      </p>
    </div>

    <div class="w-full shrink-0 sm:w-auto">
      <slot name="right">
        <NuxtLink
          v-if="actionLabel && actionTo"
          :to="actionTo"
          class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-[#18B66A] px-5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#14a45f] sm:w-auto"
        >
          <span class="text-[18px] leading-none">+</span>
          <span>{{ actionLabel }}</span>
        </NuxtLink>
      </slot>
    </div>
  </header>
</template>
