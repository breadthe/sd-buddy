<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri";
  import { onMount } from "svelte";
  import Generate from "./Generate.svelte";

  onMount(() => {
    invoke("close_splashscreen");
  });
</script>

<main>
  <Generate />
</main>

<style>
</style>
