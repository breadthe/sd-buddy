<script lang="ts">
  // store imports
  import { defaultSteps, steps, maxSteps, stepsOptions, useCustomSteps } from "../../store"

  // component imports
  import HelpBubble from "../HelpBubble.svelte"

  function handleCustomSteps(event: Event) {
    // very hacky way of swapping input <-> select without losing the value
    useCustomSteps.set(event.target.selectedOptions[0].innerText === "custom")
  }
</script>

<label class="flex flex-col w-full">
  <div class="flex items-center gap-2">
    <span class="font-bold">Steps</span>

    <HelpBubble
      title="--ddim_steps : Sampling steps, higher numbers produce more detailed images at the expense of processing time."
    />
  </div>

  {#if $useCustomSteps}
    <div class="flex items-center gap-2">
      <input type="number" bind:value={$steps} min="1" max={$maxSteps} />
      <button
        class="btn-transparent"
        on:click={() => {
          useCustomSteps.set(false)
          steps.set($defaultSteps)
        }}
        title="Switch to dropdown"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      </button>
    </div>
  {:else}
    <select bind:value={$steps} on:change={handleCustomSteps}>
      {#each $stepsOptions as option (option)}
        <option value={option}>{option}</option>
      {/each}
      <option value="10">custom</option>
    </select>
  {/if}
</label>

<style>
</style>
