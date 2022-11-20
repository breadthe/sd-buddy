<script lang="ts">
  // store imports
  import { queue, queueIsExpanded } from "../../store"

  // Flags
  let isClearing = false

  function clearQueue() {
    queue.clear()
    queueIsExpanded.set(false)
  }
</script>

{#if !isClearing}
  <button class="btn-transparent" on:click={() => (isClearing = true)}>Clear</button>
{:else}
  <div class="flex items-start justify-center h-full gap-2">
    <p class="font-bold">Stop the current run & clear the queue?</p>
    <div class="flex gap-2">
      <button
        class="btn-transparent"
        on:click={() => {
          clearQueue()
          isClearing = false
        }}
      >
        Clear
      </button>
      <button class="btn-transparent" on:click={() => (isClearing = false)}>Cancel</button>
    </div>
  </div>
{/if}

<style>
</style>
