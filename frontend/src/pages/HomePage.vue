<script setup lang="ts">
import GuestHeader from '@/shared/components/GuestHeader.vue'
import HomePageHero from '@/features/home/HomePageHero.vue'
import HomePageFaq from '@/features/home/HomePageFaq.vue'
import HomePageFooter from '@/features/home/HomePageFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-[#e8f5ff] text-slate-900">
    <GuestHeader>
      <template v-slot:top-right>
        <nav class="flex items-center gap-2">
          <RouterLink
            to="/signin"
            class="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-basic-blue hover:bg-dark-blue transition-colors duration-200"
          >
            ログイン
          </RouterLink>
        </nav>
      </template>
    </GuestHeader>

    <HomePageHero />

    <HomePageFaq />

    <HomePageFooter />
  </div>
</template>
