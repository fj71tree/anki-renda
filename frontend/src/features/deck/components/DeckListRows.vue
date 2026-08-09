<script setup lang="ts">
import { ref } from 'vue'
import type { Deck } from '../deck.types'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'

defineProps<{
  deckList: Deck[]
}>()

const emit = defineEmits<{
  (e: 'openEditModal', deckId: number): void
  (e: 'deleteDeck', deckId: number): void
}>()

//リスト三点メニューの開閉
const activeMenuId = ref<number | null>(null)
const toggleMenu = (deckId: number) => {
  activeMenuId.value = activeMenuId.value === deckId ? null : deckId
}
const closeMenu = () => {
  activeMenuId.value = null
}

const openEditModal = (deckId: number) => {
  closeMenu()
  emit('openEditModal', deckId)
}
const deleteDeck = (deckId: number) => {
  closeMenu()
  emit('deleteDeck', deckId)
}
</script>

<template>
  <!-- 透明背景 -->
  <div v-if="activeMenuId !== null" class="fixed inset-0 z-40 bg-transparent" @click="closeMenu"></div>

  <ul class="divide-y divide-slate-100">
    <li v-for="deck in deckList" :key="deck.id" class="group relative">
      <div class="relative">
        <RouterLink
          :to="`/decks/${deck.id}`"
          :class="[
            'flex items-center gap-4 px-5 sm:px-7 py-4 pr-20 transition-all',
            activeMenuId === null ? 'group-hover:bg-[#f5fbff]' : '',
          ]"
        >
          <div class="h-3 w-3 rounded-full bg-basic-blue"></div>
          <p class="text-xl font-bold text-slate-900 leading-tight truncate">
            {{ deck.name }}
          </p>
        </RouterLink>
        <button
          type="button"
          class="absolute right-6 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center text-slate-600 hover:text-slate-900 transition"
          aria-label="デッキメニュー"
          @click.stop="toggleMenu(deck.id)"
        >
          <EllipsisVerticalIcon class="size-5" />
        </button>
      </div>

      <!--縦三点リーダーを押すことで表示されるメニュー-->
      <div
        v-if="activeMenuId === deck.id"
        class="absolute right-16 top-0 z-50 w-40 rounded-2xl border border-slate-200 bg-white shadow-lg p-2"
        @click.stop
      >
        <button
          type="button"
          class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100"
        >
          ピン留めする
        </button>
        <button
          type="button"
          class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100"
          @click="openEditModal(deck.id)"
        >
          編集する
        </button>
        <button
          type="button"
          class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
          @click="deleteDeck(deck.id)"
        >
          削除する
        </button>
      </div>
    </li>
  </ul>
</template>
