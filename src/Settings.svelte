<script lang="ts">
  // system/lib/util imports
  import { setTheme } from "./utils"

  // store imports
  import { system } from "./store"
  const { theme } = system

  let selectedTheme = $theme

  const preferences = {
    themes: [
      { label: "Follow OS preference", value: "automatic" },
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" },
    ],
  }

  function saveTheme() {
    $theme = selectedTheme
    setTheme($theme)
  }
</script>

<section class="flex flex-col gap-8">
  <!-- Theme -->
  <label class="flex flex-col">
    <span class="font-bold">Theme</span>
    <select bind:value={selectedTheme} on:change={saveTheme} class="w-1/4">
      {#each preferences.themes as theme}
        <option value={theme.value}>{theme.label}</option>
      {/each}
    </select>
  </label>
</section>

<style>
</style>
