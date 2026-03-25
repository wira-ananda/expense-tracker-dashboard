<script setup lang="ts">
import { reactive, ref } from 'vue'
import AppLogo from '../AppLogo.vue'

const emit = defineEmits<{
  submit: [
    payload: {
      username: string
      email: string
      password: string
      confirmPassword: string
      agree: boolean
    }
  ]
}>()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const handleSubmit = () => {
  if (form.password.length < 6) return
  if (form.password !== form.confirmPassword) return
  if (!form.agree) return

  emit('submit', {
    username: form.username,
    email: form.email,
    password: form.password,
    confirmPassword: form.confirmPassword,
    agree: form.agree
  })
}

const isPasswordMatch = computed(() => {
  if (!form.confirmPassword) return true
  return form.password === form.confirmPassword
})
</script>

<template>
  <section class="min-h-screen bg-[#f5f7f9]">
    <div class="mx-auto flex flex-col rounded-[10px] bg-transparent">
      <!-- Brand area -->
      <div class="px-6 md:pt-5">
        <NuxtLink
          to="/"
          class="hidden md:inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#0f172a] shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:shadow-md"
        >
          <AppLogo />
          <span>ExpenseTracker</span>
        </NuxtLink>
      </div>

      <!-- Card area -->
      <div class="flex flex-1 items-center justify-center px-6 py-8">
        <div
          class="w-full max-w-110 rounded-[22px] bg-white px-7 py-8 shadow-[0_16px_40px_rgba(15,23,42,0.10)] ring-1 ring-black/5 sm:max-w-[470px] sm:px-8 sm:py-9 lg:max-w-[500px] lg:px-10 lg:py-10"
        >
          <!-- top icon -->
          <div class="mb-6 flex justify-center">
            <AppLogo
              size="h-14 w-14"
              icon-size="w-6 h-6"
            />
          </div>

          <!-- heading -->
          <div class="mb-8 text-center">
            <h1
              class="text-[20px] font-semibold leading-none tracking-[-0.02em] text-[#0f172a] sm:text-[30px]"
            >
              Create Your Account
            </h1>
            <p class="mt-3 text-[15px] leading-7 text-[#64748b] sm:text-[16px]">
              Start tracking your expenses today
            </p>
          </div>

          <!-- form -->
          <form
            class="space-y-5"
            @submit.prevent="handleSubmit"
          >
            <!-- full name -->
            <div>
              <label
                for="username"
                class="mb-2.5 block text-[14px] font-semibold text-[#0f172a]"
              >
                Full Name
              </label>

              <div class="relative">
                <input
                  id="username"
                  v-model="form.username"
                  type="text"
                  placeholder="Enter your full name"
                  autocomplete="name"
                  required
                  class="h-13.5 w-full rounded-2xl border border-[#d9dee6] bg-white px-5 text-[15px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2fbe84] focus:ring-4 focus:ring-[#2fbe84]/10 sm:h-14.5 sm:text-[16px]"
                >
              </div>
            </div>

            <!-- email -->
            <div>
              <label
                for="email"
                class="mb-2.5 block text-[14px] font-semibold text-[#0f172a]"
              >
                Email Address
              </label>

              <div class="relative">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  required
                  class="h-[54px] w-full rounded-2xl border border-[#d9dee6] bg-white pl-5 pr-14 text-[15px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2fbe84] focus:ring-4 focus:ring-[#2fbe84]/10 sm:h-14.5 sm:text-[16px]"
                >

                <span
                  class="pointer-events-none absolute inset-y-0 right-5 flex items-center text-[#9aa4b2]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M4 6h16v12H4z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m22 6-10 7L2 6"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <!-- password -->
            <div>
              <label
                for="password"
                class="mb-2.5 block text-[14px] font-semibold text-[#0f172a]"
              >
                Password
              </label>

              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a password"
                  autocomplete="new-password"
                  minlength="6"
                  required
                  class="h-13.5 w-full rounded-2xl border border-[#d9dee6] bg-white pl-5 pr-14 text-[15px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2fbe84] focus:ring-4 focus:ring-[#2fbe84]/10 sm:h-14.5 sm:text-[16px]"
                >

                <button
                  type="button"
                  class="absolute inset-y-0 right-5 flex cursor-pointer items-center text-[#9aa4b2] transition hover:text-[#64748b]"
                  @click="showPassword = !showPassword"
                >
                  <svg
                    v-if="!showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m3 3 18 18"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10.584 10.587A2 2 0 0 0 13.414 13.4"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.363 5.365A9.466 9.466 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a9.464 9.464 0 0 1-4.166 5.321"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.228 6.233A9.457 9.457 0 0 0 2.458 12c1.274 4.057 5.065 7 9.542 7a9.46 9.46 0 0 0 5.154-1.523"
                    />
                  </svg>
                </button>
              </div>

              <p class="mt-2 text-[12px] leading-5 text-[#64748b]">
                Password must be at least 6 characters.
              </p>
            </div>

            <!-- confirm password -->
            <div class="mt-4">
              <label
                for="confirmPassword"
                class="mb-2.5 block text-[14px] font-semibold text-[#0f172a]"
              >
                Confirm Password
              </label>

              <div class="relative">
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                  minlength="6"
                  required
                  :class="[
                    'h-13.5 w-full rounded-2xl border bg-white pl-5 pr-14 text-[15px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] sm:h-14.5 sm:text-[16px]',
                    !isPasswordMatch ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-[#d9dee6] focus:border-[#2fbe84] focus:ring-[#2fbe84]/10'
                  ]"
                >

                <button
                  type="button"
                  class="absolute inset-y-0 right-5 flex cursor-pointer items-center text-[#9aa4b2] transition hover:text-[#64748b]"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <svg
                    v-if="!showConfirmPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m3 3 18 18"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10.584 10.587A2 2 0 0 0 13.414 13.4"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.363 5.365A9.466 9.466 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a9.464 9.464 0 0 1-4.166 5.321"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.228 6.233A9.457 9.457 0 0 0 2.458 12c1.274 4.057 5.065 7 9.542 7a9.46 9.46 0 0 0 5.154-1.523"
                    />
                  </svg>
                </button>
              </div>

              <p
                v-if="!isPasswordMatch"
                class="mt-2 text-[12px] text-red-500 font-medium"
              >
                Passwords do not match.
              </p>
            </div>

            <!-- terms -->
            <!-- <label class="flex cursor-pointer items-start gap-3 pt-1 text-[14px] leading-6 text-[#334155]">
              <input
                v-model="form.agree"
                type="checkbox"
                required
                class="mt-1 h-4 w-4 rounded border-[#cbd5e1] text-[#2fbe84] focus:ring-[#2fbe84] cursor-pointer"
              >
              <span class="flex">
                I agree to the
                <p
                  class="font-medium text-[#2fbe84] transition hover:text-[#23986a]"
                >
                  Terms of Service
                </p>
                and
                <p
                  class="font-medium text-[#2fbe84] transition hover:text-[#23986a]"
                >
                  Privacy Policy
                </p>
              </span>
            </label> -->

            <!-- button -->
            <button
              type="submit"
              class="mt-2 flex h-13.5 w-full cursor-pointer items-center justify-center rounded-2xl bg-[#2fbe84] text-[15px] font-semibold text-white transition hover:bg-[#27a874] focus:outline-none focus:ring-4 focus:ring-[#2fbe84]/20 sm:h-[58px] sm:text-[16px]"
            >
              Create Account
            </button>
          </form>

          <!-- footer -->
          <p class="mt-7 text-center text-[14px] text-[#64748b]">
            Already have an account?
            <NuxtLink
              to="/auth/login"
              class="font-semibold text-[#2fbe84] transition hover:text-[#23986a]"
            >
              Login here
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
