<script setup lang="ts">
import { FolderPlusIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <button
    type="button"
    class="flex fixed top-20 left-[max(1rem,calc(50%-32rem+1rem))] sm:left-[max(1.5rem,calc(50%-32rem+1.5rem))] items-center justify-center z-40 h-13 w-13 rounded-full bg-basic-blue ext-white font-black hover:bg-dark-blue transition-colors duration-200"
    aria-label="デッキを追加"
  >
    <FolderPlusIcon class="size-8 text-white" />
  </button>
</template>
