<script setup lang="ts">
import { ref } from 'vue'

import AppNav from '@/shared/components/AppNav.vue'

import rendaIconAsset from '@/shared/assets/renda-icon.svg'
import { Bars3Icon } from '@heroicons/vue/24/outline'

//AppNavの開閉
const isNav = ref<boolean>(false)
const openNav = () => {
  isNav.value = true
}
const closeNav = () => {
  isNav.value = false
}
const rendaIconSrc = rendaIconAsset
</script>

<template>
  <header class="sticky top-0 z-30 backdrop-blur bg-study-gray/80 border-b border-slate-200/70">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
      <button
        type="button"
        class="flex items-center justify-center h-12 w-12 text-gray-500"
        @click="openNav"
      >
        <Bars3Icon class="size-8" />
      </button>
      <div class="flex items-center gap-3">
        <div class="h-11 w-11 grid place-items-center">
          <img :src="rendaIconSrc" alt="rendaアイコン" class="h-9 w-9" />
        </div>
        <div class="text-sm font-bold text-slate-900">Renda</div>
      </div>
      <div class="h-12 w-12" aria-hidden="true"></div>
    </div>
  </header>

  <AppNav :open="isNav" @close="closeNav" />
</template>
