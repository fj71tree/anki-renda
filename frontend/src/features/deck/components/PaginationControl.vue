<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

defineProps<{ deckCount: number }>()

const currentPageNum = 6
const maxPageNum = 6

const leftPageNum = computed(() => {
  if (maxPageNum <= 5) {
    return 1
  }

  return Math.max(1, Math.min(currentPageNum - 2, maxPageNum - 4))
})
const rightPageNum = computed(() => Math.min(leftPageNum.value + 4, maxPageNum))

const pageNumArray = computed(() =>
  Array.from(
    { length: rightPageNum.value - leftPageNum.value + 1 },
    (_, i) => leftPageNum.value + i,
  ),
)
</script>

<template>
  <nav class="flex items-center justify-center gap-2">
    <!-- Previous -->
    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
    >
      <ChevronLeftIcon class="size-5" />
    </button>

    <!-- Page numbers -->
    <button
      v-for="page in pageNumArray"
      :key="page"
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-full"
      :class="page === currentPageNum ? 'bg-basic-blue text-white' : 'hover:bg-gray-200'"
    >
      {{ page }}
    </button>

    <!-- Next -->
    <button
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
    >
      <ChevronRightIcon class="size-5" />
    </button>
  </nav>
</template>
