<script lang="ts">
  // system/lib/util imports
  import { copyToClipboard } from "../utils"

  // type imports
  import { AlertTypes } from "../types"

  // store imports
  import { copying } from "../store"

  const colors = {
    error: "bg-red-100 dark:bg-red-800",
    info: "bg-blue-100 dark:bg-blue-800",
    success: "bg-green-100 dark:bg-green-800",
    warning: "bg-yellow-100 dark:bg-yellow-800",
    neutral: "bg-gray-100 dark:bg-gray-800", // default
  }

  export let copy = false // allow copying of text
  export let alertType: AlertTypes = AlertTypes.Neutral

  let alert: HTMLDivElement

  async function copyText() {
    if (!copy) return

    copying.set(true)

    await copyToClipboard(alert.innerText)

    setTimeout(() => {
      copying.set(false)
    }, 1000)
  }
</script>

<div
  bind:this={alert}
  class={`w-full relative p-2 font-mono text-sm shadow max-h-24 overflow-auto ${colors[alertType]}`}
  class:cursor-pointer={copy}
  title={copy ? "Click to copy" : ""}
  on:click={copyText}
>
  <slot />

  {#if copy && $copying}
    <div
      class="absolute top-0 left-0 w-full h-full flex items-center justify-center"
    >
      <div class="bg-white dark:bg-gray-800 p-2 text-xs text-gray-600">
        copied!
      </div>
    </div>
  {/if}
</div>

<style>
</style>
