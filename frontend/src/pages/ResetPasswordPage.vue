<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import GuestHeader from '@/shared/components/GuestHeader.vue'
import AppFooter from '@/shared/components/AppFooter.vue'
import FormField from '@/shared/components/FormField.vue'
import { useAuthStore } from '@/features/auth/auth.store'

const route = useRoute()
const auth = useAuthStore()

const password = ref('')
const passwordConfirm = ref('')
const localError = ref<string | null>(null)
const isSubmitting = ref(false)
const isSubmitted = ref(false)

const uid = computed(() => {
  const value = route.params.uid
  return typeof value === 'string' ? value : ''
})

const token = computed(() => {
  const value = route.params.token
  return typeof value === 'string' ? value : ''
})

const errorMessage = computed(() => localError.value ?? auth.error)

const validate = () => {
  if (!uid.value || !token.value) {
    return '再設定リンクが不正です。メールのリンクを確認してください。'
  }

  if (!password.value || !passwordConfirm.value) {
    return '新しいパスワードを入力してください'
  }

  if (password.value !== passwordConfirm.value) {
    return '確認用パスワードが一致しません'
  }

  return null
}

const onSubmit = async () => {
  localError.value = validate()
  if (localError.value) {
    return
  }

  isSubmitting.value = true
  try {
    await auth.confirmPasswordReset(uid.value, token.value, password.value, passwordConfirm.value)
    isSubmitted.value = true
  } catch {
    localError.value = null
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
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">新しいパスワードを設定</h1>
          <p class="text-sm font-semibold text-slate-600">
            新しいパスワードを入力して再設定を完了します。
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
                パスワードを再設定しました。新しいパスワードでログインしてください。
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
                v-model="password"
                label="新しいパスワード"
                type="password"
                placeholder="••••••••••••••••••••"
                autocomplete="new-password"
              />

              <FormField
                v-model="passwordConfirm"
                label="新しいパスワード(確認)"
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

              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full inline-flex items-center justify-center rounded-2xl bg-basic-blue px-5 py-3.5 text-white font-black transition hover:bg-dark-blue disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {{ isSubmitting ? '送信中...' : 'パスワードを再設定' }}
              </button>
            </form>
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  </div>
</template>
