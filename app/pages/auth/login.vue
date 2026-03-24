<script setup lang="ts">
const { mutate, isPending } = useLoginMutation()

type LoginSubmitPayload = {
  usernameOrEmail: string
  password: string
  remember: boolean
}

const handleLogin = (payload: LoginSubmitPayload) => {
  mutate({
    usernameOrEmail: payload.usernameOrEmail,
    password: payload.password
  })
}
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})
</script>

<template>
  <AuthLoginComponent
    :loading="isPending"
    @submit="handleLogin"
  />
</template>
