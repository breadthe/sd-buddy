<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Run } from "../types";

  export let run: Run;

  const dispatch = createEventDispatcher();

  let isDeleting = false;
</script>

<div
  class="relative flex flex-col divide-y divide-blue-600/50 border border-blue-500/50 hover:border-blue-500 rounded"
>
  {#if !isDeleting}
    <dl class="p-2 text-xs">
      <dt class="font-bold">prompt</dt>
      <dd>{run.prompt}</dd>
    </dl>

    <dl class="p-2 grid grid-cols-2 text-xs">
      <!-- <dt class="font-bold">id</dt><dd>{run.id}</dd> -->
      <dt class="font-bold">steps</dt>
      <dd>{run.steps}</dd>
      <dt class="font-bold">elapsed</dt>
      <dd>{run.elapsed / 1000}s</dd>
    </dl>

    <button
      class="absolute bottom-0 right-0 py-0 px-0 leading-none rounded-none rounded-br rounded-tl"
      title="Delete run"
      on:click={() => (isDeleting = true)}>&times;</button
    >
  {:else}
    <div class="flex flex-col items-center gap-2 p-2">
      <p class="text-xs text-center">
        Are you sure you want to delete this run?
      </p>
      <div class="flex gap-2">
        <button
          class="link text-xs text-blue-600"
          on:click={() => (isDeleting = false)}
        >
          Cancel
        </button>
        <button
          class="link text-xs text-red-600"
          on:click={() => {
            dispatch("deleteRun", run);
            isDeleting = false;
          }}
        >
          Delete
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
</style>
