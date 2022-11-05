<script lang="ts">
  // system/lib/util imports
  import { invoke } from "@tauri-apps/api/tauri"
  import { open as openDialog } from "@tauri-apps/api/dialog"
  import { appDir } from "@tauri-apps/api/path"
  import { setTheme } from "./utils"

  // store imports
  import { theme, pythonPath } from "./store"

  // component imports
  import RegisterProjectDirectory from "./lib/RegisterProjectDirectory.svelte"

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

  async function openDirectorySelectionDialog() {
    // Open a selection dialog for directories
    const selected = await openDialog({
      directory: true,
      multiple: false,
      defaultPath: await appDir(),
    })
    if (Array.isArray(selected)) {
      // user selected multiple directories
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single directory
      python.path = selected
      pythonMessage = `<strong>${python.path}</strong>`
    }
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

<section class="flex flex-col divide-y divide-gray-500 w-full">
  <!-- Python -->
  <div class="flex gap-8 py-8 w-full">
    <div class="w-1/4">
      <h2 class="font-bold text-right">Python</h2>
      <p class="text-xs text-right">
        Stable Diffusion requires Python to be installed. Here you can auto-detect the path of the Python binary or you
        can search for it yourself.
      </p>
    </div>
    <div class="flex flex-col gap-2 w-3/4">
      {#if $pythonPath}
        <div class="">{$pythonPath}</div>
      {/if}

      <div class="flex gap-4">
        <button class="btn-small w-32" on:click={detectPython}>Detect Python</button>

        <button class="btn-small w-48" on:click={openDirectorySelectionDialog}>Locate Python manually</button>
      </div>

      {#if pythonMessage}
        <div class="flex items-center gap-4">
          <span>{@html pythonMessage}</span>

          {#if python.path}
            <button class="btn-small w-32" on:click={registerPythonPath}> Use this Python </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Stable Diffusion directory -->
  <div class="flex gap-8 py-8 w-full">
    <div class="w-1/4">
      <h2 class="font-bold text-right">Stable Diffusion</h2>
      <p class="text-xs text-right">Register the path of your Stable Diffusion project.</p>
    </div>
    <div class="flex flex-col gap-2 w-3/4">
      <RegisterProjectDirectory />
    </div>
  </div>

  <!-- Theme -->
  <div class="flex gap-8 py-8 w-full">
    <div class="w-1/4">
      <h2 class="font-bold text-right">Theme</h2>
    </div>
    <div class="w-3/4">
      <select bind:value={selectedTheme} on:change={saveTheme}>
        {#each preferences.themes as theme}
          <option value={theme.value}>{theme.label}</option>
        {/each}
      </select>
    </div>
  </div>
</section>

<style>
</style>
