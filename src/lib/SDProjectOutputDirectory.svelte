<script lang="ts">
  // store imports
  import { stableDiffusionDirectory } from "../store"

  // component imports
  import OpenDirectory from "./OpenDirectory.svelte"

  $: stableDiffusionOutputDirectory = `${$stableDiffusionDirectory}/outputs/txt2img-samples`
</script>

{#if $stableDiffusionDirectory}
  <OpenDirectory directory={stableDiffusionOutputDirectory} />
{:else}
  Stable Diffusion directory not set.
{/if}

<style>
</style>
