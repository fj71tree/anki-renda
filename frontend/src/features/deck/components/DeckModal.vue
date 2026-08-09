<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  open: boolean
  resetKey: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'addDeck', name: string, memo: string): void
}>()

const addInputDeck = () => {
  emit('addDeck', deckName.value, deckMemo.value)
}
const closeCreateModal = () => {
  resetForm()
  emit('close')
}

const deckName = ref('')
const deckMemo = ref('')

const resetForm = () => {
  deckName.value = ''
  deckMemo.value = ''
}

watch(
  () => props.resetKey,
  () => {
    resetForm()
  },
)
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <!-- 背景 -->
    <div class="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>

    <div class="relative h-full w-full grid place-items-center p-4">
      <div
        class="w-full max-w-xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="デッキ作成"
      >
        <!-- ヘッダー -->
        <div class="px-6 sm:px-8 py-4 border-b border-slate-200/70">
          <div class="flex items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="font-black text-slate-900">作成</div>
            </div>
          </div>
        </div>

        <!-- メイン -->
        <div class="px-6 sm:px-8 py-6 space-y-6">
          <div class="space-y-2">
            <label class="text-sm font-bold text-slate-800">デッキ名</label>
            <div class="rounded-2xl bg-white/80 border border-slate-200 shadow-2xs px-4 py-3">
              <input
                type="text"
                placeholder="英単語"
                class="w-full bg-transparent outline-none text-slate-900 placeholder:text-slate-400 text-base font-semibold"
                v-model="deckName"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-bold text-slate-800">メモ</label>
              <span class="text-xs font-semibold text-slate-500">任意</span>
            </div>

            <div class="rounded-2xl bg-white/80 border border-slate-200 shadow-sm px-4 py-3">
              <textarea
                rows="4"
                placeholder="このデッキの目的、範囲など"
                class="w-full bg-transparent outline-none resize-none text-sm text-slate-900 placeholder:text-slate-400 leading-relaxed"
                v-model="deckMemo"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- フッター -->
        <div class="px-6 sm:px-8 py-6 border-t border-slate-200/70 bg-white/60">
          <div class="">
            <div class="flex gap-2 justify-end">
              <button
                type="button"
                class="h-11 px-4 rounded-xl bg-white/80 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                @click="closeCreateModal"
              >
                キャンセル
              </button>

              <button
                @click="addInputDeck"
                type="button"
                class="h-11 px-5 rounded-xl bg-basic-blue text-white font-black hover:bg-dark-blue transition-colors duration-200"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
