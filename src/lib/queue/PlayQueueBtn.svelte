<script lang="ts">
  // store imports
  import { startQueue } from "../../store"

  export let disableGenerate: boolean = false
</script>

<button
  class="btn-transparent flex items-center gap-1"
  disabled={disableGenerate}
  on:click={() => startQueue.set(true)}
  title="Process the queue"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>

  <span>Process queue</span>
</button>

<style>
</style>
