<script lang="ts">
  // system/lib/util imports
  import { invoke } from "@tauri-apps/api/tauri"
  import { onMount } from "svelte"

  // component imports
  import Generate from "./Generate.svelte"
  import Runs from "./lib/Runs.svelte"
  import RegisterProjectDirectory from "./lib/RegisterProjectDirectory.svelte"

  onMount(() => {
    invoke("close_splashscreen")
  })
</script>

<main class="flex flex-col gap-8">
  <RegisterProjectDirectory />

  <Generate />

  <Runs />
</main>

<style>
</style>
