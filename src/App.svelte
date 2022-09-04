<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri";
  import { onMount } from "svelte";
  import Generate from "./Generate.svelte";
  import Runs from "./lib/Runs.svelte";

  onMount(() => {
    invoke("close_splashscreen");
  });
</script>

<main class="flex gap-8">
  <Generate />

  <Runs />
</main>

<style>
</style>
