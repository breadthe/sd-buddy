<script lang="ts">
  import { AlertTypes } from "../types";
  import { copying } from "../store";
  import { copyToClipboard } from "../utils";

  const colors = {
    error: "bg-red-100",
    info: "bg-blue-100",
    success: "bg-green-100",
    warning: "bg-yellow-100",
    neutral: "bg-gray-100", // default
  };

  export let copy = false; // allow copying of text
  export let alertType: AlertTypes = AlertTypes.Neutral;

  let alert: HTMLDivElement;

  async function copyText() {
    if (!copy) return;

    copying.set(true);

    await copyToClipboard(alert.innerText);

    setTimeout(() => {
      copying.set(false);
    }, 1000);
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
      <div class="bg-white p-2 text-xs text-gray-600">copied!</div>
    </div>
  {/if}
</div>

<style>
</style>
