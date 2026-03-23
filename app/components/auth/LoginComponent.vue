<template>
  <section class="min-h-screen bg-[#f5f7f9]">
    <div
      class="mx-auto flex flex-col rounded-[10px] bg-transparent"
    >
      <!-- Brand area -->
      <div class="px-6 pt-5">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#0f172a] shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:shadow-md"
        >
          <span
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2fbe84] text-white"
          >
            <Icon
              name="ion:wallet"
              class="h-5 w-5"
            />
          </span>
          <span>ExpenseTracker</span>
        </NuxtLink>
      </div>

      <!-- Card area -->
      <div class="flex flex-1 items-center justify-center px-6 py-8">
        <div
          class="w-full max-w-[380px] rounded-[18px] bg-white px-6 py-7 shadow-[0_12px_30px_rgba(15,23,42,0.10)] ring-1 ring-black/5"
        >
          <!-- top icon -->
          <div class="mb-5 flex justify-center">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2fbe84] text-white shadow-sm"
            >
              <Icon
                name="ion:wallet"
                class="h-5 w-5"
              />
            </div>
          </div>

          <!-- heading -->
          <div class="mb-6 text-center">
            <h1 class="text-[30px] font-extrabold leading-none tracking-[-0.02em] text-[#0f172a]">
              Welcome Back
            </h1>
            <p class="mt-3 text-[14px] leading-6 text-[#64748b]">
              Sign in to your account to continue
            </p>
          </div>

          <!-- form -->
          <form
            class="space-y-4"
            @submit.prevent="handleSubmit"
          >
            <!-- email -->
            <div>
              <label
                for="email"
                class="mb-2 block text-[13px] font-semibold text-[#0f172a]"
              >
                Email or Username
              </label>

              <div class="relative">
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="Enter your email"
                  class="h-[48px] w-full rounded-xl border border-[#d9dee6] bg-white pl-4 pr-12 text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2fbe84] focus:ring-4 focus:ring-[#2fbe84]/10"
                >

                <span
                  class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#9aa4b2]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
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
                class="mb-2 block text-[13px] font-semibold text-[#0f172a]"
              >
                Password
              </label>

              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Enter your password"
                  class="h-[48px] w-full rounded-xl border border-[#d9dee6] bg-white pl-4 pr-12 text-[14px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2fbe84] focus:ring-4 focus:ring-[#2fbe84]/10"
                >

                <button
                  type="button"
                  class="absolute inset-y-0 right-4 flex items-center text-[#9aa4b2] transition hover:text-[#64748b] cursor-pointer"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <svg
                    v-if="!showPassword"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
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
                    class="h-4 w-4"
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
            </div>

            <!-- remember -->
            <label class="flex items-center gap-2 pt-1 text-[13px] text-[#334155] cursor-pointer">
              <input
                v-model="form.remember"
                type="checkbox"
                class="h-4 w-4 rounded border-[#cbd5e1] text-[#2fbe84] focus:ring-[#2fbe84] cursor-pointer"
              >
              <span>Remember me for 30 days</span>
            </label>

            <!-- button -->
            <button
              type="submit"
              class="mt-1 flex h-[48px] w-full items-center justify-center rounded-xl bg-[#2fbe84] text-[14px] font-semibold text-white transition hover:bg-[#27a874] focus:outline-none focus:ring-4 focus:ring-[#2fbe84]/20 cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <!-- footer -->
          <p class="mt-6 text-center text-[13px] text-[#64748b]">
            Don’t have an account?
            <NuxtLink
              to="/auth/register"
              class="font-semibold text-[#2fbe84] transition hover:text-[#23986a]"
            >
              Create one here
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const emit = defineEmits<{
  submit: [
    payload: {
      email: string
      password: string
      remember: boolean
    }
  ]
}>()

const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
  remember: false
})

const handleSubmit = () => {
  emit('submit', {
    email: form.email,
    password: form.password,
    remember: form.remember
  })
}
</script>
