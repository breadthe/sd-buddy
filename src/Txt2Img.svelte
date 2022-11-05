<script lang="ts">
  // type imports
  import { AlertTypes } from "./types"

  // store imports
  import { activeSection, pythonPath, stableDiffusionDirectory } from "./store"

  // component imports
  import Alert from "./lib/Alert.svelte"
  import Generate from "./lib/Generate.svelte"
  import Runs from "./lib/Runs.svelte"
  import SDProjectOutputDirectory from "./lib/SDProjectOutputDirectory.svelte"
</script>

<section class="flex flex-col gap-8 w-full">
  {#if !$pythonPath}
    <Alert alertType={AlertTypes.Error}>
      <strong>Python path</strong> not set. Please set the path to your Python executable in
      <a href="#" on:click|preventDefault={() => activeSection.set("Settings")}>Settings</a>.
    </Alert>
  {/if}

  {#if !$stableDiffusionDirectory}
    <Alert alertType={AlertTypes.Error}>
      <strong>Stable Diffusion directory</strong> not set. Please set the path to your Stable Diffusion project directory in
      <a href="#" on:click|preventDefault={() => activeSection.set("Settings")}>Settings</a>.
    </Alert>
  {:else}
    <div class="flex gap-2">
      <strong>Output</strong>
      <SDProjectOutputDirectory />
    </div>
  {/if}

  <Generate />

  <Runs />
</section>

<style>
</style>
