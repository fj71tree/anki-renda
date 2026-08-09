<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GuestHeader from '@/shared/components/GuestHeader.vue'
import FormField from '@/shared/components/FormField.vue'
import AppFooter from '@/shared/components/AppFooter.vue'
import { useAuthStore } from '@/features/auth/auth.store'

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const agreedToTerms = ref(false)
const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)

const auth = useAuthStore()
const router = useRouter()

const validate = () => {
  if (!email.value) {
    return 'メールアドレスを入力してください'
  }

  if (!password.value || !passwordConfirm.value) {
    return 'パスワードを入力してください'
  }

  if (password.value !== passwordConfirm.value) {
    return '確認用パスワードが一致しません'
  }

  if (!agreedToTerms.value) {
    return '利用規約への同意が必要です'
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
    await auth.register(email.value, password.value, passwordConfirm.value)
    await router.push({
      name: 'signup-complete',
      query: { email: email.value },
    })
  } catch {
    errorMessage.value = auth.error
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#eef4ff]">
    <GuestHeader />

    <div class="flex items-center px-4 py-6">
      <div class="mx-auto w-full max-w-md">
        <!-- ヘッダー -->
        <div class="text-center space-y-2">
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">新規登録</h1>
        </div>

        <!-- 登録フォーム -->
        <div
          class="mt-6 rounded-3xl bg-white/80 border border-slate-200 shadow-lg shadow-[#0c8eea]/5 overflow-hidden"
        >
          <div class="p-6 space-y-5">
            <form class="space-y-4" @submit.prevent="onSubmit">
              <FormField
                v-model="email"
                label="メールアドレス"
                type="email"
                placeholder="renda@example.com"
                autocomplete="email"
              />

              <FormField
                v-model="password"
                label="パスワード"
                type="password"
                placeholder="••••••••••••••••••••"
                autocomplete="new-password"
              />

              <FormField
                v-model="passwordConfirm"
                label="パスワード(確認)"
                type="password"
                placeholder="もう一度入力"
                autocomplete="new-password"
              />

              <p
                v-if="errorMessage"
                class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              >
                {{ errorMessage }}
              </p>

              <div class="pt-1">
                <label class="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    v-model="agreedToTerms"
                    type="checkbox"
                    class="h-4 w-4 rounded border-slate-300 text-basic-blue focus:ring-[#0c8eea]/20"
                  />
                  <span>
                    <span class="font-black text-basic-blue">利用規約</span>に同意します
                  </span>
                </label>
              </div>

              <button
                type="submit"
                :disabled="isSubmitting"
                class="mt-2 w-full inline-flex items-center justify-center rounded-2xl bg-basic-blue px-5 py-3.5 text-white font-black transition hover:bg-dark-blue disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {{ isSubmitting ? '送信中...' : '登録する' }}
              </button>

              <div class="pt-2 text-center">
                <p class="text-sm font-semibold text-slate-600">
                  すでにアカウントをお持ちですか？
                  <RouterLink
                    to="/signin"
                    class="font-black text-basic-blue hover:text-dark-blue transition"
                  >
                    ログイン
                  </RouterLink>
                </p>
              </div>
            </form>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  </div>
</template>
