<script setup lang="ts">
import { AdjustmentsHorizontalIcon } from '@heroicons/vue/24/outline'
import FlashCardSetting from '@/features/study/components/FlashCardSetting.vue'
import CardCheckBox from '@/features/study/components/CardCheckBox.vue'

defineProps<{
  deckId: string
  displayMode: 'split' | 'center'
  isSettingsOpen: boolean
  isChecked: boolean
}>()

const emit = defineEmits<{
  (e: 'toggleSettings'): void
  (e: 'settingsClosed'): void
  (e: 'displayModeChanged', mode: 'split' | 'center'): void
  (e: 'checkedChanged', checked: boolean): void
}>()

const toggleSettings = () => {
  emit('toggleSettings')
}

const closeSettings = () => {
  emit('settingsClosed')
}

const handleDisplayModeChange = (mode: 'split' | 'center') => {
  emit('displayModeChanged', mode)
}

const handleCheckedChange = (checked: boolean) => {
  emit('checkedChanged', checked)
}
</script>

<template>
  <div class="relative h-14 flex items-center px-4 border-t border-slate-200/70">
    <div class="flex items-center gap-2">
      <router-link
        :to="`/decks/${deckId}`"
        class="text-sm font-semibold text-slate-500 hover:text-slate-700"
      >
        カード一覧へ
      </router-link>
    </div>

    <div class="pointer-events-none absolute inset-x-0 flex items-center justify-center">
      <div class="relative pointer-events-auto">
        <button
          type="button"
          class="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none"
          aria-label="表示設定"
          @click.stop="toggleSettings"
        >
          <AdjustmentsHorizontalIcon class="size-6" />
        </button>
      </div>
    </div>

    <div class="ml-auto flex items-center gap-3">
      <div>
        <CardCheckBox :checked="isChecked" @change="handleCheckedChange" />
      </div>
    </div>
  </div>

  <FlashCardSetting
    v-if="isSettingsOpen"
    :display-mode="displayMode"
    @close="closeSettings"
    @change-display-mode="handleDisplayModeChange"
  />
</template>
