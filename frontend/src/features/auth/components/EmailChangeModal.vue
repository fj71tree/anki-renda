<script setup lang="ts">
import FormField from '@/shared/components/FormField.vue'

defineProps<{
  emailChangeStep: 'input' | 'sent'
  localEmailError: string | null
  isEmailSubmitting: boolean
}>()

const emit = defineEmits<{
  (e: 'closeEmailModal'): void
  (e: 'submitEmailChange'): void
}>()

const newEmail = defineModel<string>('newEmail', {
  required: true,
})

const closeEmailModal = () => {
  emit('closeEmailModal')
}

const submitEmailChange = () => {
  emit('submitEmailChange')
}
</script>
<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm px-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="email-change-title"
  >
    <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 id="email-change-title" class="mt-1 text-xl font-black text-slate-900">
            メールアドレスを変更する
          </h3>
        </div>
      </div>

      <form
        v-if="emailChangeStep === 'input'"
        class="mt-6 space-y-4"
        @submit.prevent="submitEmailChange"
      >
        <FormField
          v-model="newEmail"
          label="新しいメールアドレス"
          type="email"
          placeholder="new@example.com"
          autocomplete="email"
        />

        <p v-if="localEmailError" class="text-sm font-semibold text-red-600">
          {{ localEmailError }}
        </p>

        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            @click="closeEmailModal"
          >
            キャンセル
          </button>
          <button
            type="submit"
            class="rounded-lg bg-basic-blue px-4 py-2 text-sm font-black text-white transition hover:bg-dark-blue disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isEmailSubmitting"
          >
            {{ isEmailSubmitting ? '送信中...' : '送信する' }}
          </button>
        </div>
      </form>

      <div v-else class="mt-6 space-y-5">
        <p class="text-sm font-semibold leading-7 text-slate-700">
          確認メールを送信しました。メールに記載されたリンクを開くと変更が完了します。
        </p>
        <div class="flex justify-end">
          <button
            type="button"
            class="rounded-lg bg-basic-blue px-4 py-2 text-sm font-black text-white transition hover:bg-dark-blue"
            @click="closeEmailModal"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
