<script setup lang="ts">
import { ref } from 'vue'
import type { Card } from '../card.types'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'

defineProps<{
  cardList: Card[]
}>()

const emit = defineEmits<{
  (e: 'openEditModal', cardId: number): void
  (e: 'deleteCard', cardId: number): void
}>()

const openEditModal = (cardId: number) => {
  closeMenu()
  emit('openEditModal', cardId)
}

const deleteCard = (cardId: number) => {
  closeMenu()
  emit('deleteCard', cardId)
}

//リスト三点メニューの開閉
const activeMenuId = ref<number | null>(null)
const toggleMenu = (cardId: number) => {
  activeMenuId.value = activeMenuId.value === cardId ? null : cardId
}
const closeMenu = () => {
  activeMenuId.value = null
}
</script>

<template>
  <!-- 透明背景 -->
  <div
    v-if="activeMenuId !== null"
    class="fixed inset-0 z-40 bg-transparent"
    @click="closeMenu"
  ></div>

  <div v-for="card in cardList" :key="card.id" class="relative">
    <!--カードリストの一行-->
    <div class="flex items-center justify-between gap-4">
      <!--チェックボックス-->
      <label class="inline-flex items-centern pl-3">
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 text-basic-blue focus:ring-basic-blue"
          :aria-label="`カード${card.id}を選択`"
        />
      </label>

      <!--問題と答え-->
      <div class="flex items-center gap-4 flex-1 pt-3 pb-3 pl-1 pr-10">
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-3 text-sm font-black text-slate-900">
            <div class="text-xs font-black text-slate-500 tracking-wide">問題:</div>
            <div class="flex-1 font-black text-slate-900 leading-relaxed">
              {{ card.question }}
            </div>
          </div>
          <div class="flex items-center gap-3 text-sm font-semibold text-slate-900">
            <div class="text-xs font-black text-slate-500 tracking-wide">答え:</div>
            <div class="flex-1 font-black text-slate-900 leading-relaxed">
              {{ card.answer }}
            </div>
          </div>
        </div>
      </div>

      <!--三点メニュー-->
      <div class="relative">
        <button
          type="button"
          class="absolute right-6 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center text-slate-600 hover:text-slate-900 transition"
          aria-label="デッキメニュー"
          @click.stop="toggleMenu(card.id)"
        >
          <EllipsisVerticalIcon class="size-5" />
        </button>

        <!--縦三点リーダーを押すことで表示されるメニュー-->
        <div
          v-if="activeMenuId === card.id"
          class="absolute right-16 -top-10 z-50 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg p-2"
          @click.stop
        >
          <button
            type="button"
            class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            このカードから暗記開始する
          </button>
          <button
            type="button"
            class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-100"
            @click="openEditModal(card.id)"
          >
            編集する
          </button>
          <button
            type="button"
            class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
            @click="deleteCard(card.id)"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
