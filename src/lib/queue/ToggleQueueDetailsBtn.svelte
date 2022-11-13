<script lang="ts">
  // store imports
  import { queueIsExpanded } from "../../store"

  $: title = `${$queueIsExpanded ? "Collapse" : "Expand"} queue details`
</script>

<button class="btn-transparent" {title} on:click={() => queueIsExpanded.set(!$queueIsExpanded)}>
  {#if $queueIsExpanded}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-4 h-4"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  {:else}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="w-4 h-4"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  {/if}
</button>

<style>
</style>
