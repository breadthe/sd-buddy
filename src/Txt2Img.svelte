<script lang="ts">
  // component imports
  import Generate from "./lib/Generate.svelte"
  import Runs from "./lib/Runs.svelte"
  import RegisterProjectDirectory from "./lib/RegisterProjectDirectory.svelte"
</script>

<section class="flex flex-col gap-8 w-full">
  <RegisterProjectDirectory />

  <Generate />

  <Runs />
</section>

<style>
</style>
