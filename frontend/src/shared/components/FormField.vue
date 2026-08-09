<script setup lang="ts">
import { computed, useId } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id?: string
  label: string
  type?: string
  placeholder?: string
}>()

const inputValue = defineModel<string>()

const autoId = useId()
const inputId = computed(() => props.id ?? autoId)
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label :for="inputId" class="text-sm font-bold text-slate-800">
        {{ props.label }}
      </label>
      <slot name="action"></slot>
    </div>

    <div
      class="group rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 shadow-sm flex items-center gap-3"
    >
      <input
        :id="inputId"
        :type="props.type ?? 'text'"
        :placeholder="props.placeholder"
        class="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-semibold"
        v-model="inputValue"
        v-bind="$attrs"
      />
    </div>
  </div>
</template>
