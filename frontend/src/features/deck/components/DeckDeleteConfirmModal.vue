<script setup lang="ts">
defineProps<{
  deletingDeckName: string
}>()

const emit = defineEmits<{
  (e: 'deleteCanceled'): void
  (e: 'deleteConfirmed'): void
}>()

const closeDeleteConfirmModal = () => {
  emit('deleteCanceled')
}

const confirmDeleteDeck = () => {
  emit('deleteConfirmed')
}
</script>

<template>
  <div class="fixed inset-0 z-50">
    <div
      class="absolute inset-0 bg-black/25 backdrop-blur-sm"
      @click="closeDeleteConfirmModal"
    ></div>
    <div class="relative h-full w-full grid place-items-center p-4">
      <div
        class="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="デッキ削除確認"
      >
        <div class="px-6 sm:px-8 py-6 space-y-4">
          <p class="text-base font-bold text-slate-900 leading-relaxed">
            <template v-if="deletingDeckName">
              {{ deletingDeckName }}デッキを削除しますか？デッキ内のカードもすべて削除されます。
            </template>
            <template v-else>
              このデッキを削除しますか？デッキ内のカードもすべて削除されます。
            </template>
          </p>
        </div>
        <div class="px-6 sm:px-8 py-5 border-t border-slate-200/70 bg-white/60">
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="h-11 px-4 rounded-xl bg-white/80 border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
              @click="closeDeleteConfirmModal"
            >
              キャンセル
            </button>
            <button
              type="button"
              class="h-11 px-5 rounded-xl bg-rose-600 text-white font-black hover:bg-rose-700 transition-colors duration-200"
              @click="confirmDeleteDeck"
            >
              削除する
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
