<script lang="ts">
  // system/lib/util imports
  import { txt2ImgParams } from "../../utils"

  // type imports
  import { QueueItemStatus, type QueueItem } from "../../types"

  // store imports
  import { queue, incompleteQueue, queueIsProcessing, queueIsExpanded, currentQueueItem } from "../../store"

  // component imports
  import ClearQueueBtn from "./ClearQueueBtn.svelte"
  import PlayQueueBtn from "./PlayQueueBtn.svelte"
  import StopQueueBtn from "./StopQueueBtn.svelte"
  import ToggleQueueDetailsBtn from "./ToggleQueueDetailsBtn.svelte"

  // only skipped items
  $: skippedQueueItems = $queue.filter((qi: QueueItem) => qi.status === QueueItemStatus.Skipped)

  // excludes skipped items
  $: totalQueueItems = $queue.filter((qi: QueueItem) => qi.status !== QueueItemStatus.Skipped)

  // excludes completed and skipped items
  $: remainingQueueItems = $queue.filter(
    // (qi: QueueItem) => qi.status === QueueItemStatus.Skipped || qi.status === QueueItemStatus.Completed
    (qi: QueueItem) => qi.status === QueueItemStatus.Pending || qi.status === QueueItemStatus.Running
  )

  function removeItem(id: string) {
    queue.remove(id)
  }

  function toggleSkipItem(id: string) {
    queue.toggleSkip(id)
  }
</script>

<div class="flex flex-col bg-blue-100 dark:bg-blue-800">
  <div class="flex items-center justify-between p-2">
    <div class="flex items-center gap-4">
      <h2 class="font-bold">
        Queue <small class="text-xs font-normal">
          ({totalQueueItems.length}{skippedQueueItems.length ? ` + ${skippedQueueItems.length} skipped` : ""})
        </small>
      </h2>

      {#if $incompleteQueue.length > 0}
        {#if $queueIsProcessing}
          <StopQueueBtn />
        {:else}
          <PlayQueueBtn />
        {/if}
      {/if}
    </div>

    {#if $currentQueueItem}
      <div class="text-xs">
        processing ({totalQueueItems.length - remainingQueueItems.length + 1} of {totalQueueItems.length}) <strong>{$currentQueueItem.id}</strong>&hellip;
      </div>
    {/if}

    <div class="flex items-center gap-4">
      {#if $incompleteQueue.length > 0}
        <ClearQueueBtn />
        <ToggleQueueDetailsBtn />
      {/if}
    </div>
  </div>

  {#if $queueIsExpanded}
    {#each $incompleteQueue as queueItem (queueItem.id)}
      <div
        class="flex items-start gap-2 border-t border-blue-300 dark:border-blue-600"
        class:bg-gray-300={queueItem.status === QueueItemStatus.Skipped}
        class:dark:bg-gray-500={queueItem.status === QueueItemStatus.Skipped}
        class:bg-green-100={queueItem.status === QueueItemStatus.Running}
        class:dark:bg-green-800={queueItem.status === QueueItemStatus.Running}
        class:bg-purple-100={queueItem.status === QueueItemStatus.Completed}
        class:dark:bg-purple-800={queueItem.status === QueueItemStatus.Completed}
      >
        <div class="flex gap-2">
          {#if queueItem.status === QueueItemStatus.Running}
            <span class="text-sm ml-2">running</span>
          {:else}
            <button class="btn-transparent text-sm font-normal ml-2" on:click={() => removeItem(queueItem.id)}
              >&times;</button
            >
            <button class="btn-transparent text-sm font-normal" on:click={() => toggleSkipItem(queueItem.id)}>
              {queueItem.status === QueueItemStatus.Skipped ? "unskip" : "skip"}
            </button>
          {/if}
        </div>
        <div class="w-full font-mono">
          <small>{queueItem.id}</small>
          <small>{@html txt2ImgParams(queueItem.run, true)}</small>
        </div>
      </div>
    {:else}
      <p class="text-center text-gray-500 dark:text-gray-500 pb-2">No items in queue.</p>
    {/each}
  {/if}
</div>

<style>
</style>
