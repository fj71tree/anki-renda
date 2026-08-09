<script setup lang="ts">
import FormField from '@/shared/components/FormField.vue'

defineProps<{
  passwordChangeStep: 'input' | 'sent'
  localPasswordError: string | null
  isPasswordSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'closePasswordModal'): void
  (e: 'submitPasswordChange'): void
}>()

const currentPassword = defineModel<string>('currentPassword', {
  required: true,
})

const newPassword = defineModel<string>('newPassword', {
  required: true,
})

const newPasswordConfirmation = defineModel<string>('newPasswordConfirmation', {
  required: true,
})

const closePasswordModal = () => {
  emit('closePasswordModal')
}

const submitPasswordChange = () => {
  emit('submitPasswordChange')
}
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="password-change-title"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 id="password-change-title" class="mt-1 text-xl font-black text-slate-900">
            パスワードを変更する
          </h3>
        </div>
      </div>

      <form
        v-if="passwordChangeStep === 'input'"
        class="mt-6 space-y-4"
        @submit.prevent="submitPasswordChange"
      >
        <FormField
          v-model="currentPassword"
          label="現在のパスワード"
          type="password"
          placeholder="••••••••••••••••••"
          autocomplete="current-password"
        />
        <FormField
          v-model="newPassword"
          label="新しいパスワード"
          type="password"
          placeholder="••••••••••••••••••"
          autocomplete="new-password"
        />
        <FormField
          v-model="newPasswordConfirmation"
          label="新しいパスワード（確認）"
          type="password"
          placeholder="•••••••••••••••••"
          autocomplete="new-password"
        />

        <p v-if="localPasswordError" class="text-sm font-semibold text-red-600">
          {{ localPasswordError }}
        </p>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            @click="closePasswordModal"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="rounded-lg bg-basic-blue px-4 py-2 text-sm font-black text-white transition hover:bg-dark-blue disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isPasswordSubmitting"
          >
            {{ isPasswordSubmitting ? '送信中...' : '送信する' }}
          </button>
        </div>
      </form>

      <div v-else class="mt-6 space-y-5">
        <p class="text-sm font-semibold leading-7 text-slate-700">
          パスワードを変更しました。次回以降は新しいパスワードでサインインしてください。
        </p>
        <div class="flex justify-end">
          <button
            type="button"
            class="rounded-lg bg-basic-blue px-4 py-2 text-sm font-black text-white transition hover:bg-dark-blue"
            @click="closePasswordModal"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
