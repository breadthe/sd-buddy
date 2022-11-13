<script lang="ts">
  // store imports
  import { stopQueue, queueIsProcessing } from "../../store"

  export let disableGenerate: boolean = false

  function stop() {
    stopQueue.set(true)
    queueIsProcessing.set(false) // this is not needed, it's handled in Generate
    console.log("stopped queue")

    // @todo do more stuff here
    // - kill the current process
  }
</script>

<button
  class="btn-transparent flex items-center gap-1"
  disabled={disableGenerate}
  on:click={stop}
  title="Stop queue"
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
    <path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z" />
  </svg>

  <span>Stop processing</span>
</button>

<style>
</style>
