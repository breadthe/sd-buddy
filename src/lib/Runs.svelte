<script lang="ts">
  // type imports
  import type { Run } from "../types"

  // store imports
  import { generate } from "../store"
  const { runs, sortedRuns } = generate

  // component imports
  import RunControls from "./RunControls.svelte"
  import RunItem from "./RunItem.svelte"

  export let template: string = "txt2img" // txt2img | gallery

  function deleteRun(event: CustomEvent<Run>) {
    const run = event.detail
    runs.remove(run)
  }
</script>

<aside class="flex flex-col gap-2 w-full">
  <div class="flex items-center justify-between gap-4">
    <h2 class="font-bold">
      {template === "txt2img" ? "Runs" : "Images"}
      <small class="text-xs font-normal">({$runs.length})</small>
    </h2>

    <RunControls />
  </div>

  {#if $runs.length}
    <div class="flex flex-wrap gap-2">
      {#each $sortedRuns as run (run.id)}
        <RunItem {run} {template} on:deleteRun={(e) => deleteRun(e)} />
      {/each}
    </div>
  {:else}
    <p class="text-xs text-center text-neutral-500">
      No {template === "txt2img" ? "runs" : "images"} yet
    </p>
  {/if}
</aside>

<style>
</style>
