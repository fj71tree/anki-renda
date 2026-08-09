<template>
  <button
    type="button"
    class="flex fixed top-20 left-[max(1rem,calc(50%-32rem+1rem))] sm:left-[max(1.5rem,calc(50%-32rem+1.5rem))] items-center justify-center z-40 h-13 w-13 rounded-full text-white bg-basic-blue ext-white font-black hover:bg-dark-blue transition-colors duration-200"
    aria-label="カードを追加"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      class="w-9 h-9 text-white"
      aria-label="カード追加"
    >
      <rect
        x="64"
        y="256"
        width="896"
        height="512"
        rx="170"
        fill="none"
        stroke="currentColor"
        stroke-width="32"
      />

      <circle cx="184" cy="512" r="64" fill="none" stroke="currentColor" stroke-width="32" />

      <line
        x1="720"
        y1="512"
        x2="880"
        y2="512"
        stroke="currentColor"
        stroke-width="48"
        stroke-linecap="round"
      />
      <line
        x1="800"
        y1="432"
        x2="800"
        y2="592"
        stroke="currentColor"
        stroke-width="48"
        stroke-linecap="round"
      />
    </svg>
  </button>
</template>
