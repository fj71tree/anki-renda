<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  displayMode: 'split' | 'center'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'change-display-mode', mode: 'split' | 'center'): void
}>()

const isDisplayModeMenuOpen = ref(false)

const close = () => {
  isDisplayModeMenuOpen.value = false
  emit('close')
}

const toggleDisplayModeMenu = () => {
  isDisplayModeMenuOpen.value = !isDisplayModeMenuOpen.value
}

const setDisplayMode = (mode: 'split' | 'center') => {
  emit('change-display-mode', mode)
}

watch(
  () => props.displayMode,
  () => {
    isDisplayModeMenuOpen.value = false
  },
)
</script>

<template>
  <div class="fixed inset-0 z-50" @click="close">
    <div class="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
    <div class="absolute inset-0 flex items-center justify-center px-4">
      <div
        class="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between gap-2">
          <div class="text-sm font-semibold text-slate-800">設定</div>
          <button
            type="button"
            aria-label="設定モーダルを閉じる"
            class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none"
            @click.stop="close"
          >
            <span aria-hidden="true" class="text-lg leading-none">×</span>
          </button>
        </div>
        <div class="mt-4 flex items-center justify-between gap-3">
          <span class="text-sm text-slate-700">表示方法</span>
          <div class="relative">
            <button
              type="button"
              class="flex min-w-32 items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:border-slate-400 focus-visible:outline-none"
              @click.stop="toggleDisplayModeMenu"
            >
              <span>{{ props.displayMode === 'split' ? '上下表示' : '中央表示' }}</span>
              <span class="text-[10px] leading-none">▼</span>
            </button>
            <div
              v-if="isDisplayModeMenuOpen"
              class="absolute right-0 top-full z-30 mt-1 w-32 rounded-md border border-slate-200 bg-white p-1 shadow-md"
            >
              <button
                type="button"
                class="block w-full rounded px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none"
                @click.stop="setDisplayMode('split')"
              >
                上下表示
              </button>
              <button
                type="button"
                class="block w-full rounded px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline-none"
                @click.stop="setDisplayMode('center')"
              >
                中央表示
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
