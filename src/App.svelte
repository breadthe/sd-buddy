<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri";
  import { onMount } from "svelte";
  import { open } from "@tauri-apps/api/dialog";
  import { get, set } from "tauri-settings";
  import { appDir } from "@tauri-apps/api/path";

  type directory = {
    stableDiffusionDirectory: string;
  };

  /*
  --ddim_steps 1 (0.6s)
  --ddim_steps 10 (6s)
  --ddim_steps 50 (30s) default
  --ddim_steps 100 (1m) 2m on M1 Pro
  */
  let stableDiffusionDirectoryInput: HTMLInputElement;
  let stableDiffusionDirectory: string = "";
  let stableDiffusionCommand: string = "";
  let stableDiffusionCommandHtml: string = "";
  let rustResponse: string = "";
  let rustError: string = "";
  let generating: boolean = false;

  // Form parameters
  const placeholder =
    "a red juicy apple floating in outer space, like a planet";
  let prompt: string = "";
  let steps: string = "10"; // default 50

  // Duration timers
  let startTimer: Date;
  let endTimer: Date;
  let elapsed: number = 0;

  $: stableDiffusionDirectoryIsRegistered =
    stableDiffusionDirectoryInput &&
    stableDiffusionDirectoryInput.value.trim() !== "";

  $: {
    stableDiffusionCommand = `python scripts/txt2img.py --prompt "${prompt}" --n_samples 1 --n_iter 1 --plms --ddim_steps ${steps}`;
    stableDiffusionCommandHtml = `python scripts/txt2img.py --prompt <strong>"${prompt}"</strong> --n_samples 1 --n_iter 1 --plms --ddim_steps <strong>${steps}</strong>`;
  }

  async function openDirectorySelectionDialog() {
    // Open a selection dialog for directories
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: await appDir(),
    });
    if (Array.isArray(selected)) {
      // user selected multiple directories
    } else if (selected === null) {
      // user cancelled the selection
    } else {
      // user selected a single directory
      stableDiffusionDirectoryInput.value = selected;
    }
  }

  async function saveStableDiffusionDirectory() {
    stableDiffusionDirectory = stableDiffusionDirectoryInput.value;
    stableDiffusionDirectoryInput.value = "";

    // Saves to /Users/your.user/Library/Application Support/com.sd-buddy.breadthe/settings.json
    set<directory>("stableDiffusionDirectory", stableDiffusionDirectory)
      .then(() => console.log("Stable Diffusion directory saved"))
      .catch((err) => console.log(err));
  }

  async function generate() {
    if (stableDiffusionDirectory.trim() === "") return;
    if (stableDiffusionCommand.trim() === "") return;

    generating = true;
    elapsed = 0;
    rustResponse = "";
    rustError = "";
    startTimer = new Date();

    // Invoke the Stable Diffusion command
    await invoke("stable_diffusion_command", {
      command: stableDiffusionCommand,
    })
      .then((res) => {
        console.log(res);
        rustResponse = JSON.stringify(res);
      })
      .catch((err) => {
        console.log(err);
        rustError = JSON.stringify(err);
      })
      .finally(() => {
        generating = false;
        endTimer = new Date();
        elapsed = endTimer - startTimer; // in ms
      });
  }

  onMount(() => {
    invoke("close_splashscreen");

    get<directory>("stableDiffusionDirectory").then((directory) => {
      stableDiffusionDirectory = directory;
    }).catch((err) => {
      // do nothing, the user will have to set the directory
    });
  });
</script>

<main class="flex flex-col gap-8">
  <div class="flex flex-col gap-2">
    <div class="flex gap-2">
      <input
        bind:this={stableDiffusionDirectoryInput}
        type="text"
        placeholder="/absolute/path/to/Stable/Diffusion/directory"
        class="flex-1"
      />

      <button
        class=""
        title="Browse directories"
        on:click={openDirectorySelectionDialog}>Browse</button
      >

      <button
        class=""
        title="Register Stable Diffusion directory"
        disabled={!stableDiffusionDirectoryIsRegistered}
        on:click={saveStableDiffusionDirectory}>Save</button
      >
    </div>

    {#if stableDiffusionDirectory}
      <small class="font-mono text-blue-600">{stableDiffusionDirectory}</small>
    {/if}
  </div>

  <div class="flex flex-col gap-2">
    <textarea
      type="text"
      rows="5"
      cols="50"
      bind:value={prompt}
      {placeholder}
    />

    <select name="steps" id="steps" bind:value={steps}>
      <option value="1">1</option>
      <option value="10" selected>10</option>
      <option value="50">50 (default)</option>
      <option value="100">100</option>
    </select>

    <button
      class=""
      disabled={!stableDiffusionDirectory || prompt.trim() === "" || generating}
      on:click={generate}>{generating ? "generating..." : "Generate!"}</button
    >

    {#if prompt.trim() !== ""}
      <div class="p-2 bg-blue-100 font-mono text-sm shadow">
        {@html stableDiffusionCommandHtml}
      </div>
    {/if}

    {#if elapsed}
      <div class="p-2 bg-gray-100 font-mono text-sm shadow">
        Elapsed: {elapsed / 1000}s
      </div>
    {/if}

    {#if rustResponse}
      {@const html = JSON.parse(rustResponse).replaceAll("\n", "<br>")}
      <div class="p-2 bg-green-100 font-mono text-sm shadow">
        {@html html}
      </div>
    {/if}

    {#if rustError}
      {@const html = JSON.parse(rustError).replaceAll("\n", "<br>")}
      <div class="p-2 bg-red-100 font-mono text-sm shadow">
        {@html html}
      </div>
    {/if}
  </div>
</main>

<style>
</style>
