<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import router from '@/router'
import { useAuthStore } from '@/features/auth/auth.store'
import AuthSettingButton from '@/features/auth/components/AuthSettingButton.vue'
import DeleteAccountModal from '@/features/auth/components/DeleteAccountModal.vue'
import EmailChangeModal from '@/features/auth/components/EmailChangeModal.vue'
import PasswordChangeModal from '@/features/auth/components/PasswordChangeModal.vue'

const auth = useAuthStore()

// email変更モーダルの状態
const isEmailModalOpen = ref(false)
const emailChangeStep = ref<'input' | 'sent'>('input')
const newEmail = ref('')
const localEmailError = ref<string | null>(null)
const isEmailSubmitting = ref(false)
const currentEmail = computed(() => auth.currentUser?.email ?? '')

// email変更モーダルの操作
const openEmailModal = () => {
  newEmail.value = ''
  localEmailError.value = null
  emailChangeStep.value = 'input'
  isEmailModalOpen.value = true
}
const closeEmailModal = () => {
  isEmailModalOpen.value = false
}
const submitEmailChange = async () => {
  const trimmedEmail = newEmail.value.trim()
  localEmailError.value = null

  if (!trimmedEmail) {
    localEmailError.value = 'メールアドレスを入力してください'
    return
  }

  isEmailSubmitting.value = true
  try {
    await auth.requestEmailChange(trimmedEmail)
    emailChangeStep.value = 'sent'
  } catch {
    localEmailError.value = auth.error ?? 'メールアドレス変更メールの送信に失敗しました'
  } finally {
    isEmailSubmitting.value = false
  }
}

// password変更モーダルの状態
const isPasswordModalOpen = ref(false)
const passwordChangeStep = ref<'input' | 'sent'>('input')
const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirmation = ref('')
const localPasswordError = ref<string | null>(null)
const isPasswordSubmitting = ref(false)

// password変更モーダルの操作
const openPasswordModal = () => {
  currentPassword.value = ''
  newPassword.value = ''
  newPasswordConfirmation.value = ''
  localPasswordError.value = null
  passwordChangeStep.value = 'input'
  isPasswordModalOpen.value = true
}
const closePasswordModal = () => {
  isPasswordModalOpen.value = false
}
const submitPasswordChange = async () => {
  localPasswordError.value = null

  if (!currentPassword.value) {
    localPasswordError.value = '現在のパスワードを入力してください'
    return
  }

  if (!newPassword.value) {
    localPasswordError.value = '新しいパスワードを入力してください'
    return
  }

  if (!newPasswordConfirmation.value) {
    localPasswordError.value = '確認用のパスワードを入力してください'
    return
  }

  if (newPassword.value !== newPasswordConfirmation.value) {
    localPasswordError.value = '新しいパスワードが一致しません'
    return
  }

  isPasswordSubmitting.value = true
  try {
    await auth.requestPasswordChange(
      currentPassword.value,
      newPassword.value,
      newPasswordConfirmation.value,
    )
    passwordChangeStep.value = 'sent'
  } catch {
    localPasswordError.value = auth.error ?? 'パスワードの変更に失敗しました'
  } finally {
    isPasswordSubmitting.value = false
  }
}

// account削除モーダルの状態
const isDeleteModalOpen = ref(false)
const deleteConfirmationText = ref('')
const localDeleteError = ref<string | null>(null)
const isDeleteSubmitting = ref(false)

// account削除モーダルの操作
const openDeleteModal = () => {
  deleteConfirmationText.value = ''
  localDeleteError.value = null
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
}

const submitDeleteAccount = async () => {
  localDeleteError.value = null

  if (deleteConfirmationText.value.trim() !== '削除') {
    localDeleteError.value = '確認のため「削除」と入力してください'
    return
  }

  isDeleteSubmitting.value = true
  try {
    await auth.deleteAccount()
    closeDeleteModal()
    await router.replace({ name: 'signin' })
  } catch {
    localDeleteError.value = auth.error ?? 'アカウントの削除に失敗しました'
  } finally {
    isDeleteSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    await auth.fetchCurrentUser()
  } catch {
    // エラーメッセージはauth.errorを画面に表示する。
  }
})
</script>

<template>
  <section class="space-y-4">
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-sm font-bold tracking-wide text-slate-500">メールアドレス</h2>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p class="text-base font-semibold text-slate-900">{{ currentEmail }}</p>
        <AuthSettingButton @click="openEmailModal" />
      </div>
      <p v-if="auth.error" class="mt-3 text-sm font-semibold text-red-600">
        {{ auth.error }}
      </p>
    </article>

    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-sm font-bold tracking-wide text-slate-500">パスワード</h2>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p class="text-base font-semibold text-slate-900">••••••••••••••••••</p>
        <AuthSettingButton @click="openPasswordModal" />
      </div>
    </article>

    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-sm font-bold tracking-wide text-slate-500">アカウント削除</h2>
      <div class="mt-4">
        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-slate-100"
          @click="openDeleteModal"
        >
          アカウントを削除する
        </button>
      </div>
    </article>

    <EmailChangeModal
      v-if="isEmailModalOpen"
      v-model:new-email="newEmail"
      :emailChangeStep="emailChangeStep"
      :localEmailError="localEmailError"
      :isEmailSubmitting="isEmailSubmitting"
      @closeEmailModal="closeEmailModal"
      @submitEmailChange="submitEmailChange"
    />
    <PasswordChangeModal
      v-if="isPasswordModalOpen"
      v-model:current-password="currentPassword"
      v-model:new-password="newPassword"
      v-model:new-password-confirmation="newPasswordConfirmation"
      :passwordChangeStep="passwordChangeStep"
      :localPasswordError="localPasswordError"
      :isPasswordSubmitting="isPasswordSubmitting"
      @closePasswordModal="closePasswordModal"
      @submitPasswordChange="submitPasswordChange"
    />
    <DeleteAccountModal
      v-if="isDeleteModalOpen"
      v-model:delete-confirmation-text="deleteConfirmationText"
      :localDeleteError="localDeleteError"
      :isDeleteSubmitting="isDeleteSubmitting"
      @closeDeleteModal="closeDeleteModal"
      @submitDeleteAccount="submitDeleteAccount"
    />
  </section>
</template>
