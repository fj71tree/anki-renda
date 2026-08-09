<script setup lang="ts">
const faqs = [
  {
    q: 'Rendaとはなんですか？',
    a: '暗記カードを作成できるアプリです。作成した暗記カードは、連打することで高速で反復できます。',
  },
  {
    q: '無料で使えますか？',
    a: '無料でお使いいただけます。',
  },
  {
    q: '作成した暗記カードはどこに保存されますか？',
    a: 'オンラインで保存されます。同じアカウントを使えば、スマホとパソコンで同期することも可能です。',
  },
]
</script>

<template>
  <section class="max-w-6xl mx-auto px-6 pb-16">
    <div class="text-center">
      <h2 class="text-2xl font-extrabold tracking-tight">よくある質問</h2>
    </div>

    <div class="mt-8">
      <div
        v-for="(f, i) in faqs"
        :key="i"
        class="mb-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm p-5"
      >
        <div class="font-semibold">
          {{ f.q }}
        </div>
        <p class="mt-3 text-sm text-slate-600 leading-relaxed">
          {{ f.a }}
        </p>
      </div>
    </div>
  </section>
</template>
