<script lang="ts">
  // type imports
  import { AlertTypes } from "./types"

  // store imports
  import { activeSection, pythonPath } from "./store"

  // component imports
  import Alert from "./lib/Alert.svelte"
  import Generate from "./lib/Generate.svelte"
  import Runs from "./lib/Runs.svelte"
  import RegisterProjectDirectory from "./lib/RegisterProjectDirectory.svelte"
</script>

<section class="flex flex-col gap-8 w-full">
  {#if !$pythonPath}
    <Alert alertType={AlertTypes.Error}>
      Python path not set. Please set the path to your Python executable in
      <a href="#" on:click|preventDefault={() => activeSection.set("Settings")}>Settings</a>.
    </Alert>
  {/if}

  <RegisterProjectDirectory />

  <Generate />

  <Runs />
</section>

<style>
</style>
