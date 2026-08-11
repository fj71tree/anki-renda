<script setup lang="ts">
import { useRouter } from 'vue-router'
import rendaIconAsset from '@/shared/assets/renda-icon.svg'
import { useAuthStore } from '@/features/auth/auth.store'

defineProps<{
  open: boolean
}>()
const emit = defineEmits<{
  (e: 'close'): void
}>()
const closeNav = () => {
  emit('close')
}

const auth = useAuthStore()
const router = useRouter()
const rendaIconSrc = rendaIconAsset

const onSignOut = async () => {
  await auth.logout()
  closeNav()
  await router.push('/signin')
}
</script>

<template>
  <div v-if="open">
    <!-- 左上ハンバーガー（見た目だけ） -->
    <button
      type="button"
      class="fixed top-10 left-8 z-40 grid h-12 w-12 place-items-center rounded-full"
      aria-label="メニュー"
    ></button>

    <!-- 開いた状態（固定） -->
    <Teleport to="body">
      <div class="fixed inset-0 z-50 bg-[#0B1B2B]/35 backdrop-blur-[2px]" @click="closeNav"></div>

      <!-- ドロワー -->
      <aside
        class="fixed left-0 top-0 z-60 flex h-dvh w-[340px] max-w-[88vw] flex-col bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        @click.stop
      >
        <div class="relative border-blue-100 px-6 h-20 py-4 flex items-center">
          <div class="flex items-center gap-3">
            <div class="h-14 w-14 grid place-items-center">
              <img :src="rendaIconSrc" alt="rendaアイコン" />
            </div>

            <div class="text-lg font-bold">Renda</div>
          </div>
        </div>

        <!-- メニュー -->
        <nav class="flex flex-1 flex-col p-2">
          <div>
            <RouterLink to="/decks">
              <div class="p-4 rounded-2xl font-semibold hover:bg-blue-50">デッキ一覧</div>
            </RouterLink>
            <RouterLink to="/settings">
              <div class="p-4 rounded-2xl font-semibold hover:bg-blue-50">設定</div>
            </RouterLink>
          </div>
          <div class="mt-auto border-t border-slate-200 pt-2 pb-4">
            <button
              type="button"
              class="w-full rounded-2xl p-4 text-left font-semibold text-slate-700 hover:bg-blue-50"
              @click="onSignOut"
            >
              サインアウト
            </button>
          </div>
        </nav>
      </aside>
    </Teleport>
  </div>
</template>
