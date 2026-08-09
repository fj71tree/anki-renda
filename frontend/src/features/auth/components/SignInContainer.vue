<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FormField from '@/shared/components/FormField.vue'
import { useAuthStore } from '../auth.store'

const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)
const isDemoSubmitting = ref(false)

const auth = useAuthStore()
const router = useRouter()

const validate = () => {
  if (!email.value) {
    return 'メールアドレスを入力してください'
  }

  if (!password.value) {
    return 'パスワードを入力してください'
  }

  return null
}

const onSubmit = async () => {
  // フォームの入力チェック
  errorMessage.value = validate()
  if (errorMessage.value) {
    return
  }

  isSubmitting.value = true
  try {
    await auth.login(email.value, password.value)
    await router.push('/decks')
  } finally {
    isSubmitting.value = false
  }
}

const onDemoLogin = async () => {
  isDemoSubmitting.value = true
  try {
    await auth.demoLogin()
    await router.push('/decks')
  } finally {
    isDemoSubmitting.value = false
  }
}
</script>

<template>
  <div
    class="mt-8 rounded-3xl bg-white/80 border border-slate-200 shadow-lg shadow-[#0c8eea]/5 overflow-hidden"
  >
    <div class="p-8 space-y-6">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <FormField
          label="メールアドレス"
          type="email"
          placeholder="renda@example.com"
          v-model="email"
        />

        <FormField
          label="パスワード"
          type="password"
          placeholder="••••••••••••••••••••"
          v-model="password"
        >
          <template v-slot:action>
            <RouterLink
              to="/forgot-password"
              class="text-xs font-bold text-basic-blue hover:text-dark-blue transition"
            >
              パスワードを忘れた
            </RouterLink>
          </template>
        </FormField>

        <p
          v-if="errorMessage"
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="isSubmitting || isDemoSubmitting"
          class="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-basic-blue px-5 py-3.5 text-white font-black hover:bg-dark-blue transition"
        >
          {{ isSubmitting ? 'ログイン中...' : 'ログイン' }}
        </button>

        <button
          type="button"
          :disabled="isSubmitting || isDemoSubmitting"
          class="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-basic-blue px-5 py-3.5 text-basic-blue font-black hover:bg-sky-50 transition disabled:opacity-60"
          @click="onDemoLogin"
        >
          {{ isDemoSubmitting ? 'デモログイン中...' : 'デモログイン' }}
        </button>

        <p v-if="auth.error" class="text-sm font-semibold text-red-600">
          {{ auth.error }}
        </p>

        <div class="pt-2 text-center">
          <p class="text-sm font-semibold text-slate-600">
            はじめてですか？
            <RouterLink
              to="/signup"
              class="font-black text-basic-blue hover:text-dark-blue transition"
            >
              新規登録
            </RouterLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>
