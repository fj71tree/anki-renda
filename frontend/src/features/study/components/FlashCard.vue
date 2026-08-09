<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  question: string
  answer: string
  isAnswerVisible: boolean
  deckName: string
  displayMode: 'split' | 'center'
  isFirstCard: boolean
  isCenterGuideOpen: boolean
  isSplitGuideOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'click', area: 'top' | 'bottom'): void
  (e: 'change-display-mode', mode: 'split' | 'center'): void
}>()

const isQuestionPreviewOpen = ref(false)

const handleClick = (area: 'top' | 'bottom') => {
  emit('click', area)
}

const toggleQuestionPreview = () => {
  isQuestionPreviewOpen.value = !isQuestionPreviewOpen.value
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.repeat) return
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault()
  }
  if (e.key === 'ArrowRight') {
    emit('click', 'bottom')
  }
  if (e.key === 'ArrowLeft') {
    emit('click', 'top')
  }
}

watch(
  () => props.displayMode,
  () => {
    isQuestionPreviewOpen.value = false
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="w-full h-screen flex flex-col bg-transparent overflow-hidden">
    <div v-if="displayMode === 'split'" class="relative w-full flex-1 flex flex-col select-none">
      <button
        type="button"
        class="flex-1 px-5 py-5 flex items-center justify-center text-center border-b border-slate-200/70 cursor-pointer focus-visible:outline-none"
        @click="handleClick('top')"
      >
        <div class="w-full max-w-3xl whitespace-pre-wrap wrap-break-word text-[28px]">
          {{ question }}
        </div>
      </button>
      <button
        type="button"
        class="flex-1 px-5 py-5 flex items-center justify-center text-center cursor-pointer focus-visible:outline-none"
        @click="handleClick('bottom')"
      >
        <div
          class="w-full max-w-3xl whitespace-pre-wrap wrap-break-word"
          :class="isAnswerVisible ? 'text-[28px] text-slate-700' : 'text-xl text-slate-400'"
        >
          {{ isAnswerVisible ? answer : '' }}
        </div>
      </button>
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isSplitGuideOpen && isFirstCard && !isAnswerVisible"
          class="pointer-events-none absolute bottom-3 inset-x-0 z-30 mx-auto max-w-xs rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs leading-relaxed text-slate-500 shadow-md md:max-w-sm md:px-4 md:py-3 md:text-sm lg:max-w-md lg:text-base"
        >
          カードの上半分を押すと前へ戻り、下半分を押すと次へ進みます。
        </div>
      </Transition>
    </div>
    <div v-else class="relative w-full flex-1 select-none">
      <button
        type="button"
        class="absolute inset-x-0 top-0 z-0 h-1/2 cursor-pointer focus-visible:outline-none"
        aria-label="前の問題へ"
        @click="handleClick('top')"
      ></button>
      <button
        type="button"
        class="absolute inset-x-0 bottom-0 z-0 h-1/2 cursor-pointer focus-visible:outline-none"
        aria-label="答え表示または次の問題へ"
        @click="handleClick('bottom')"
      ></button>
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-1"
      >
        <div
          v-if="isCenterGuideOpen"
          class="pointer-events-none absolute bottom-3 inset-x-0 z-30 mx-auto max-w-xs rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs leading-relaxed text-slate-500 shadow-md md:max-w-sm md:px-4 md:py-3 md:text-sm lg:max-w-md lg:text-base"
        >
          カードの上半分を押すと前へ戻り、下半分を押すと次へ進みます。
        </div>
      </Transition>

      <div class="absolute top-4 inset-x-0 z-20 flex justify-center pointer-events-none">
        <div class="pointer-events-auto">
          <button
            type="button"
            class="flex items-center gap-3 rounded-full border border-slate-300 bg-white/90 px-4 py-2 text-sm text-slate-600 hover:border-slate-400 focus-visible:outline-none"
            @click.stop="toggleQuestionPreview"
          >
            <span>常に問題を表示</span>
            <span
              class="relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors"
              :class="isQuestionPreviewOpen ? 'bg-slate-500' : 'bg-slate-300'"
            >
              <span
                class="size-5 rounded-full bg-white shadow-sm transition-transform"
                :class="isQuestionPreviewOpen ? 'translate-x-5' : 'translate-x-0'"
              ></span>
            </span>
            <span class="min-w-8 text-xs font-medium text-slate-600">
              {{ isQuestionPreviewOpen ? 'ON' : 'OFF' }}
            </span>
          </button>
        </div>
      </div>

      <div class="relative z-10 h-full w-full px-5 py-5 text-center pointer-events-none">
        <div class="absolute inset-0 flex items-center justify-center px-5">
          <div class="relative w-full max-w-3xl">
            <div
              class="w-full max-h-[42vh] overflow-y-auto whitespace-pre-wrap wrap-break-word text-[28px]"
              :class="isAnswerVisible ? 'text-slate-700' : 'text-slate-900'"
            >
              {{ isAnswerVisible ? answer : question }}
            </div>
            <div
              v-if="isQuestionPreviewOpen"
              class="pointer-events-auto absolute left-0 right-0 top-full mt-2 px-2"
            >
              <div
                class="max-h-[24vh] overflow-y-auto whitespace-pre-wrap wrap-break-word text-sm text-slate-400"
              >
                {{ question }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
