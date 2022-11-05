<script lang="ts">
  // system/lib/util imports
  import { invoke } from "@tauri-apps/api/tauri"
  import { setTheme } from "./utils"

  // store imports
  import { theme, pythonPath } from "./store"

  let pythonMessage: string = ""
  let python = {
    binary: null,
    path: null,
    version: null,
  }

  let selectedTheme = $theme

  const preferences = {
    themes: [
      { label: "Follow OS preference", value: "automatic" },
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" },
    ],
  }

  async function detectPython() {
    await invoke("detect_python")
      .then(async (res: string) => {
        if (res === "NOT_FOUND") {
          pythonMessage = `Python not found`
        } else {
          python = { ...JSON.parse(res) }
          pythonMessage = `<strong>${python.version}</strong> found at <strong>${python.path}</strong>`
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {})
  }

  function registerPythonPath() {
    $pythonPath = python.path
    python = {
      binary: null,
      path: null,
      version: null,
    }
    pythonMessage = ""
  }

  function saveTheme() {
    $theme = selectedTheme
    setTheme($theme)
  }
</script>

<section class="flex flex-col gap-8">
  <!-- Python -->
  <div class="flex flex-col w-1/4">
    <span class="font-bold">Python</span>

    {#if $pythonPath}
      <span>Python binary path: {$pythonPath}</span>
    {/if}

    <button on:click={detectPython}>Detect Python</button>

    {#if pythonMessage}
      <span>
        {@html pythonMessage}
      </span>
    {/if}

    {#if python.path}
      <button on:click={registerPythonPath}> Use this Python </button>
    {/if}
  </div>

  <!-- Theme -->
  <label class="flex flex-col w-1/4">
    <span class="font-bold">Theme</span>
    <select bind:value={selectedTheme} on:change={saveTheme}>
      {#each preferences.themes as theme}
        <option value={theme.value}>{theme.label}</option>
      {/each}
    </select>
  </label>
</section>

<style>
</style>
