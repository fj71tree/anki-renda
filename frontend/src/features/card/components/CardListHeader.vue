<script setup lang="ts">
defineProps<{
  deckName: string
}>()
</script>

<template>
  <div class="px-5 sm:px-7 py-4">
    <p class="text-lg font-black text-slate-900">{{ deckName }}</p>
  </div>
</template>
