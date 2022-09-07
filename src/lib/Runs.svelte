<script lang="ts">
  import { runs } from "../store";
  import type { Run } from "../types";
  import RunItem from "./RunItem.svelte";

  $: sortedRuns = $runs.sort(
    (a: { ended_at: Date }, b: { ended_at: Date }) =>
      Date.parse(b.ended_at) - Date.parse(a.ended_at)
  );

  function deleteRun(event: CustomEvent<Run>) {
    const run = event.detail;
    runs.remove(run);
  }
</script>

<aside class="flex flex-col gap-2 w-full">
  <h2 class="font-bold">Runs <small class="text-xs font-normal">({$runs.length})</small></h2>
  {#if $runs.length}
    <div class="flex flex-wrap gap-2">
      {#each sortedRuns as run (run.id)}
        <RunItem {run} on:deleteRun={(e) => deleteRun(e)} />
      {/each}
    </div>
  {:else}
    <p class="text-xs text-center text-gray-500">No runs yet</p>
  {/if}
</aside>

<style>
</style>
