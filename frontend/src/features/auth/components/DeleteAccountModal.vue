<script setup lang="ts">
defineProps<{
  localDeleteError: string | null
  isDeleteSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'closeDeleteModal'): void
  (e: 'submitDeleteAccount'): void
}>()

const deleteConfirmationText = defineModel<string>('deleteConfirmationText', {
  required: true,
})

const closeDeleteModal = () => {
  emit('closeDeleteModal')
}

const submitDeleteAccount = () => {
  emit('submitDeleteAccount')
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-account-title"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div class="space-y-3">
        <h3 id="delete-account-title" class="text-xl font-black text-slate-900">
          アカウントを削除する
        </h3>
        <p class="text-sm font-semibold leading-7 text-slate-700">
          アカウントを削除すると、学習データを含むすべての情報が失われます。
        </p>
        <p class="text-sm font-semibold leading-7 text-slate-700">
          確認のため、下の入力欄に「削除」と入力してから実行してください。
        </p>
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="submitDeleteAccount">
        <div class="space-y-2">
          <label for="delete-account-confirmation" class="text-sm font-bold text-slate-800">
            確認文字列
          </label>
          <div class="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm">
            <input
              id="delete-account-confirmation"
              v-model="deleteConfirmationText"
              type="text"
              placeholder="削除"
              class="w-full bg-transparent font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              autocomplete="off"
            />
          </div>
        </div>

        <p v-if="localDeleteError" class="text-sm font-semibold text-red-600">
          {{ localDeleteError }}
        </p>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            @click="closeDeleteModal"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="rounded-lg bg-red-700 px-4 py-2 text-sm font-black text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isDeleteSubmitting || deleteConfirmationText.trim() !== '削除'"
          >
            {{ isDeleteSubmitting ? '削除中...' : '削除する' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
