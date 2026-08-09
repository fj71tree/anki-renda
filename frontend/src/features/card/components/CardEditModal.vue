<script setup lang="ts">
import { ref } from 'vue'
import type { Card } from '../card.types'

const props = defineProps<{
  editingCard?: Card | null
}>()

const emit = defineEmits<{
  (e: 'closeEditModal'): void
  (e: 'updateCard', id: number, question: string, answer: string): void
}>()

const closeEditModal = () => {
  emit('closeEditModal')
}

const updateCard = () => {
  emit('updateCard', props.editingCard!.id, cardQuestion.value, cardAnswer.value)
}

const cardQuestion = ref(props.editingCard!.question)
const cardAnswer = ref(props.editingCard!.answer)
</script>

<template>
  <div class="fixed inset-0 z-50 min-h-[calc(100vh-64px)] px-4 py-6 sm:px-8 sm:py-10">
    <div class="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>

    <div class="flex justify-center absolute inset-0">
      <div class="z-10 flex items-center justify-center w-full max-w-4xl translate-y-0">
        <div class="w-5xl">
          <div class="rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div class="px-6 sm:px-8 py-6">
              <div class="border-b border-slate-200 pb-4">
                <div class="font-black text-slate-900">編集</div>
              </div>

              <div class="h-[430px] overflow-y-auto pr-1 pt-4">
                <div class="min-h-full flex flex-col justify-center gap-6">
                  <!-- 問題カード -->
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

                  <!-- 答えカード -->
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

            <!-- フッター -->
            <div class="px-6 sm:px-8 py-6 border-t border-slate-200/70 bg-white/60">
              <div class="flex gap-8 justify-end">
                <button
                  type="button"
                  class="h-11 px-4 rounded-xl bg-white/80 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                  @click="closeEditModal"
                >
                  キャンセル
                </button>

                <button
                  type="button"
                  class="h-11 px-5 rounded-xl bg-basic-blue hover:bg-dark-blue transition-colors duration-200 text-white font-black"
                  @click="updateCard"
                >
                  完了
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
