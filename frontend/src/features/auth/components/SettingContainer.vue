<script setup lang="ts">
import AuthHeader from '@/shared/components/AuthHeader.vue'
import AuthSettingContainer from '@/features/auth/components/AuthSettingContainer.vue'
</script>

<template>
  <div class="min-h-screen bg-study-gray pb-20">
    <AuthHeader />

    <main class="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <h1 class="text-xl font-black tracking-tight text-slate-900">アカウント設定</h1>

      <AuthSettingContainer />
    </main>
  </div>
</template>
