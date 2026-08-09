<script setup lang="ts">
import rendaIconAsset from '@/shared/assets/renda-icon.svg'

const rendaIconSrc = rendaIconAsset
</script>

<template>
  <header class="sticky top-0 z-30 backdrop-blur bg-[#eef4ff] border-b border-slate-200/70">
    <div class="w-full px-6 h-20 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-3">
        <div class="h-14 w-14 grid place-items-center">
          <img :src="rendaIconSrc" alt="rendaアイコン" />
        </div>
        <div class="leading-tight">
          <div class="text-lg font-bold">Renda</div>
        </div>
      </RouterLink>

      <slot name="top-right"></slot>
    </div>
  </header>
</template>
