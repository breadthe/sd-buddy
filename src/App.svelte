<script lang="ts">
  // system/lib/util imports
  import { invoke } from "@tauri-apps/api/tauri"
  import { onMount } from "svelte"

  // store imports
  import { activeSection } from "./store"

  // section imports
  import Gallery from "./Gallery.svelte"
  import Img2Img from "./Img2Img.svelte"
  import Settings from "./Settings.svelte"
  import Txt2Img from "./Txt2Img.svelte"

  // component imports
  import Nav from "./lib/Nav.svelte"
  import Theme from "./lib/Theme.svelte"

  const sections = [
    { id: "Txt2Img", component: Txt2Img },
    { id: "Img2Img", component: Img2Img },
    { id: "Gallery", component: Gallery },
    { id: "Settings", component: Settings },
  ]

  onMount(() => {
    invoke("close_splashscreen")
  })
</script>

<main class="flex flex-col gap-2">
  <Nav />

  <!-- Dynamic section based on activeSection -->
  <svelte:component
    this={sections.find((section) => section.id === $activeSection).component}
  />

  <!-- Renderless, conditionally sets "dark" class on the html element -->
  <Theme />
</main>

<style>
</style>
