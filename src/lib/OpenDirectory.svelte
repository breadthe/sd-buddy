<script lang="ts">
  // system/lib/util imports
  import { open } from "@tauri-apps/api/shell"

  export let directory: string

  async function openDirectory() {
    await open(`file://${directory}`)
  }
</script>

<a
  href={`file://${directory}`}
  class="font-mono text-base text-blue-600 hover:underline"
  on:click|preventDefault={openDirectory}>{directory}</a
>

<style>
</style>
