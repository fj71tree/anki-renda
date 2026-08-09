<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'addCard', question: string, answer: string): void
}>()

const cardQuestion = ref('')
const cardAnswer = ref('')
const activeTab = ref<'manual' | 'ai'>('manual')
const aiPrompt = ref('')
const aiGeneratedCards = ref<{ id: number; question: string; answer: string }[]>([])

const resetForm = () => {
  cardQuestion.value = ''
  cardAnswer.value = ''
  aiPrompt.value = ''
  aiGeneratedCards.value = []
  activeTab.value = 'manual'
}

const closeCreateCardModal = () => {
  resetForm()
  emit('close')
}

const addInputCard = () => {
  emit('addCard', cardQuestion.value, cardAnswer.value)
  cardQuestion.value = ''
  cardAnswer.value = ''
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-white">
    <div class="flex h-full flex-col overflow-hidden">
      <div class="flex flex-1 min-h-0 flex-col gap-4 px-6 sm:px-8 py-6">
        <div class="border-b border-slate-200">
          <div class="-mb-px">
            <div class="px-1 pb-3 text-sm font-semibold transition-colors">作成</div>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto pr-1">
          <div class="min-h-full flex flex-col justify-center gap-6">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-slate-800">問題</label>
                <span class="text-xs font-semibold text-slate-500">必須</span>
              </div>

              <div class="rounded-2xl bg-white/85 border border-slate-200">
                <textarea
                  rows="3"
                  placeholder="問題"
                  class="w-full bg-transparent outline-none resize-none text-base font-semibold text-slate-900 placeholder:text-slate-400 leading-relaxed px-4 py-4"
                  v-model="cardQuestion"
                ></textarea>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-bold text-slate-800">答え</label>
                <span class="text-xs font-semibold text-slate-500">必須</span>
              </div>

              <div class="rounded-2xl bg-white/85 border border-slate-200">
                <textarea
                  rows="3"
                  placeholder="答え"
                  class="w-full bg-transparent outline-none resize-none text-base font-semibold text-slate-900 placeholder:text-slate-400 leading-relaxed px-4 py-4"
                  v-model="cardAnswer"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-6 sm:px-8 py-3 border-t border-slate-200/70 bg-white/60">
        <div class="flex gap-8 justify-end">
          <button
            type="button"
            @click="closeCreateCardModal"
            class="h-11 px-4 rounded-xl bg-white/80 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
          >
            終了
          </button>

          <button
            @click="addInputCard"
            type="button"
            class="h-11 px-5 rounded-xl bg-basic-blue hover:bg-dark-blue transition-colors duration-200 text-white font-black"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
