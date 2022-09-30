<script lang="ts">
  // component imports
  import Generate from "./lib/Generate.svelte"
  import Runs from "./lib/Runs.svelte"
  import RegisterProjectDirectory from "./lib/RegisterProjectDirectory.svelte"
</script>

<div class="flex flex-col gap-8">
  <RegisterProjectDirectory />

  <Generate />

  <Runs />
</div>

<style>
</style>
