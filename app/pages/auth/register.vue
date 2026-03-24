<script setup lang="ts">
const { mutate, isPending } = useRegisterMutation()

type RegisterSubmitPayload = {
  username: string
  email: string
  password: string
}

const handleRegister = (payload: RegisterSubmitPayload) => {
  mutate({
    username: payload.username,
    email: payload.email,
    password: payload.password
  })
}
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})
</script>

<template>
  <AuthRegisterComponent
    :loading="isPending"
    @submit="handleRegister"
  />
</template>
