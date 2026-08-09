<script setup lang="ts">
import { ref } from 'vue'
import GuestHeader from '@/shared/components/GuestHeader.vue'
import AppFooter from '@/shared/components/AppFooter.vue'
import FormField from '@/shared/components/FormField.vue'
import { useAuthStore } from '@/features/auth/auth.store'

const auth = useAuthStore()

const email = ref('')
const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)
const isSubmitted = ref(false)

const onSubmit = async () => {
  errorMessage.value = email.value ? null : 'メールアドレスを入力してください'
  if (errorMessage.value) {
    return
  }

  isSubmitting.value = true
  try {
    await auth.requestPasswordReset(email.value)
    isSubmitted.value = true
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

    <div class="flex items-center px-4 py-14">
      <div class="mx-auto w-full max-w-md">
        <div class="text-center space-y-2">
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">パスワード再設定</h1>
          <p class="text-sm font-semibold text-slate-600">
            登録済みメールアドレス宛に再設定リンクを送信します。
          </p>
        </div>

        <div
          class="mt-8 rounded-3xl border border-slate-200 bg-white/80 shadow-lg shadow-[#0c8eea]/5 overflow-hidden"
        >
          <div class="p-8 space-y-6">
            <div v-if="isSubmitted" class="space-y-4 text-center">
              <p
                class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-semibold text-emerald-700"
              >
                パスワード再設定メールを送信しました。メール内のリンクから新しいパスワードを設定してください。
              </p>
              <RouterLink
                to="/signin"
                class="inline-flex w-full items-center justify-center rounded-2xl bg-basic-blue px-5 py-3.5 text-sm font-black text-white transition hover:bg-dark-blue"
              >
                ログイン画面へ
              </RouterLink>
            </div>

            <form v-else class="space-y-4" @submit.prevent="onSubmit">
              <FormField
                v-model="email"
                label="メールアドレス"
                type="email"
                placeholder="renda@example.com"
                autocomplete="email"
              />

              <p
                v-if="errorMessage"
                class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              >
                {{ errorMessage }}
              </p>

              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full inline-flex items-center justify-center rounded-2xl bg-basic-blue px-5 py-3.5 text-white font-black transition hover:bg-dark-blue disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {{ isSubmitting ? '送信中...' : '再設定メールを送る' }}
              </button>

              <RouterLink
                to="/signin"
                class="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                ログインへ戻る
              </RouterLink>
            </form>
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  </div>
</template>
