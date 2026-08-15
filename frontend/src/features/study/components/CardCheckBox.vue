<script setup lang="ts">
defineProps<{
  checked: boolean
}>()

const emit = defineEmits<{
  (e: 'change', checked: boolean): void
}>()

const onChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  emit('change', input.checked)
}
</script>

<template>
  <label>
    <input type="checkbox" class="peer hidden" :checked="checked" @change="onChange" />

    <span
      class="size-10 rounded-md border-2 border-gray-300 flex items-center justify-center peer-checked:[&_svg]:opacity-100"
    >
      <svg
        viewBox="0 0 24 24"
        class="size-4 text-gray-300 opacity-0"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  </label>
</template>
