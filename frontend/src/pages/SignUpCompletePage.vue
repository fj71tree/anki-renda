<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GuestHeader from '@/shared/components/GuestHeader.vue'
import AppFooter from '@/shared/components/AppFooter.vue'

const route = useRoute()

const email = computed(() => {
  const value = route.query.email
  return typeof value === 'string' ? value : ''
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
            <h1 class="text-3xl font-black tracking-tight text-slate-900">
              確認メールを送信しました
            </h1>
            <p class="text-sm font-semibold leading-7 text-slate-600">
              <span v-if="email">{{ email }} 宛に確認メールを送信しました。</span>
              メール内のリンクを開いて認証を完了してください。
            </p>
          </div>

          <div class="mt-8 space-y-3">
            <RouterLink
              to="/signin"
              class="inline-flex w-full items-center justify-center rounded-2xl bg-basic-blue px-5 py-3.5 text-sm font-black text-white transition hover:bg-dark-blue"
            >
              ログイン画面へ
            </RouterLink>
          </div>
        </div>

        <AppFooter />
      </div>
    </div>
  </div>
</template>
