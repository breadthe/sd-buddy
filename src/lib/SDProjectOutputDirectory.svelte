<script lang="ts">
  // system/lib/util imports
  import { open } from "@tauri-apps/api/shell"

  // store imports
  import { stableDiffusionDirectory } from "../store"

  $: stableDiffusionOutputDirectory = `${$stableDiffusionDirectory}/outputs/txt2img-samples`

  async function openDirectory(directory: string) {
    await open(`file://${directory}`)
  }
</script>

{#if $stableDiffusionDirectory}
  <a
    href={`file://${stableDiffusionOutputDirectory}`}
    class="font-mono text-base text-blue-600 hover:underline"
    on:click|preventDefault={() => openDirectory(stableDiffusionOutputDirectory)}>{stableDiffusionOutputDirectory}</a
  >
{:else}
  Stable Diffusion directory not set.
{/if}

<style>
</style>
