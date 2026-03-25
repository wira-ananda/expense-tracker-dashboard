<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: string
    iconSize?: string
    rounded?: string
    bgClass?: string
  }>(),
  {
    size: 'h-10 w-10',
    iconSize: 'h-5 w-5',
    rounded: 'rounded-xl',
    bgClass: 'bg-[#2fbe84]'
  }
)
</script>

<template>
  <span
    :class="[
      'flex items-center justify-center text-white',
      props.size,
      props.rounded,
      props.bgClass
    ]"
  >
    <Icon
      name="ion:wallet"
      :class="props.iconSize"
    />
  </span>
</template>
