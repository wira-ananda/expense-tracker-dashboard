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
  <header class="flex items-start justify-between gap-4 px-8 pb-6 pt-8">
    <div class="min-w-0">
      <h1
        class="text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#0F172A]"
      >
        {{ title }}
      </h1>

      <p
        v-if="subtitle"
        class="mt-2 text-[15px] font-thin text-[#64748B]"
      >
        {{ subtitle }}
      </p>
    </div>

    <div class="shrink-0">
      <slot name="right">
        <NuxtLink
          v-if="actionLabel && actionTo"
          :to="actionTo"
          class="inline-flex h-12 items-center gap-2 rounded-[12px] bg-[#18B66A] px-5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#14a45f]"
        >
          <span class="text-[18px] leading-none">+</span>
          <span>{{ actionLabel }}</span>
        </NuxtLink>
      </slot>
    </div>
  </header>
</template>
