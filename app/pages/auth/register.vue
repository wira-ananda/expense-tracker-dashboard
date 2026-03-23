<template>
  <div>
    <AuthRegisterComponent />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})
</script>
