<script setup lang="ts">
import HomePageCardMock from './HomePageCardMock.vue'
</script>

<template>
  <section class="relative">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-1/2 -left-24 h-96 w-96 rounded-full bg-white/50 blur-3xl"></div>
      <div
        class="absolute top-1 left-1/2 translate-x-70 h-112 w-80 rounded-full bg-[#7fd0ff]/20 blur-2xl"
      ></div>
      <div class="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-[#7fd0ff]/20 blur-2xl"></div>
    </div>

    <div class="max-w-6xl mx-auto px-6 pt-16 pb-14 relative">
      <div class="grid grid-cols-2 gap-10 items-center">
        <div>
          <h1 class="mt-5 text-5xl font-extrabold tracking-tight leading-[1.05]">
            <span class="text-[#0c8eea]">暗記だけに集中</span>できる。
          </h1>

          <p class="mt-5 text-slate-600 text-lg leading-relaxed">
            作成したカードを連打することで、問題→答え→次の問題と高速でアウトプットできます。
          </p>

          <div class="mt-8 flex items-center gap-3">
            <RouterLink
              to="/decks"
              class="px-6 py-3 rounded-2xl bg-basic-blue text-white font-semibold hover:bg-dark-blue transition-colors duration-200"
            >
              はじめる
            </RouterLink>
          </div>
        </div>

        <HomePageCardMock />
      </div>
    </div>
  </section>
</template>
