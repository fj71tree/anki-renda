<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import GuestHeader from '@/shared/components/GuestHeader.vue'
import AppFooter from '@/shared/components/AppFooter.vue'
import { useAuthStore } from '@/features/auth/auth.store'

const route = useRoute()
const auth = useAuthStore()

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('認証を確認しています。')

const verificationKey = computed(() => {
  const key = route.params.key
  return typeof key === 'string' ? key : ''
})

const isEmailChangeFlow = computed(() => route.query.flow === 'email-change')

onMounted(async () => {
  if (!verificationKey.value) {
    status.value = 'error'
    message.value = '認証キーが見つかりません。メールのリンクを再度確認してください。'
    return
  }

  try {
    await auth.verifyEmail(verificationKey.value)
    status.value = 'success'
    message.value = isEmailChangeFlow.value
      ? 'メールアドレスの変更が完了しました。'
      : 'メール認証が完了しました。ログイン画面からサインインしてください。'
  } catch {
    status.value = 'error'
    message.value = isEmailChangeFlow.value
      ? 'メールアドレスの変更に失敗しました。リンクが期限切れの可能性があります。'
      : (auth.error ?? 'メール認証に失敗しました。リンクが期限切れの可能性があります。')
  }
})
</script>

<template>
  <div class="min-h-screen bg-[#eef4ff]">
    <GuestHeader />

    <div class="flex items-center px-4 py-14">
      <div class="mx-auto w-full max-w-md">
        <div
          class="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-lg shadow-[#0c8eea]/5"
        >
          <div class="space-y-4 text-center">
            <p class="text-sm font-black tracking-[0.2em] text-basic-blue">Renda</p>
            <h1 class="text-3xl font-black tracking-tight text-slate-900">メール認証</h1>
            <p class="text-sm font-semibold leading-7 text-slate-600">
              {{ message }}
            </p>
          </div>

          <div class="mt-8 space-y-3">
            <div
              v-if="status === 'loading'"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600"
            >
              しばらくお待ちください
            </div>

            <RouterLink
              v-else-if="!isEmailChangeFlow"
              to="/signin"
              class="inline-flex w-full items-center justify-center rounded-2xl bg-basic-blue px-5 py-3.5 text-sm font-black text-white transition hover:bg-dark-blue"
            >
              ログイン画面へ
            </RouterLink>

            <div
              v-else
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600"
            >
              このページは閉じて問題ありません
            </div>

            <RouterLink
              v-if="status === 'error' && !isEmailChangeFlow"
              to="/signup"
              class="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              新規登録へ戻る
            </RouterLink>
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  </div>
</template>
