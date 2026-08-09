<script setup lang="ts">
import GuestHeader from '@/shared/components/GuestHeader.vue'
import AppFooter from '@/shared/components/AppFooter.vue'
import SignInContainer from '@/features/auth/components/SignInContainer.vue'
</script>

<template>
  <div class="min-h-screen bg-[#eef4ff]">
    <GuestHeader />

    <div class="flex items-center px-4 py-14">
      <div class="mx-auto w-full max-w-md">
        <!-- Header -->
        <div class="text-center space-y-2">
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">ログイン</h1>
        </div>

        <SignInContainer />

        <AppFooter />
      </div>
    </div>
  </div>
</template>
