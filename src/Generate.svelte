<script lang="ts">
  import { open as openDialog } from "@tauri-apps/api/dialog";
  import { appDir } from "@tauri-apps/api/path";
  import { open } from "@tauri-apps/api/shell";
  import { invoke } from "@tauri-apps/api/tauri";
  import { onMount } from "svelte";
  import { get, set } from "tauri-settings";
  import { v4 as uuidv4 } from "uuid";
  import { AlertTypes, Rating } from "./types";
  import type { Run } from "./types";
  import { runs, reusePrompt } from "./store";
  import Alert from "./lib/Alert.svelte";

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
  $: stableDiffusionDirectory = "";
  let stableDiffusionOutputDirectory: string = "";
  let stableDiffusionCommand: string = "";
  let stableDiffusionCommandHtml: string = "";
  let rustResponse: string = "";
  let rustError: string = "";

  // Flags
  let isGenerating: boolean = false;
  let useCustomSteps: boolean = false;

  // Form parameters
  const placeholder =
    "a red juicy apple floating in outer space, like a planet";
  let prompt: string = "";
  let defaultSteps: number = 10; // default --ddim_steps 50
  let steps: number = 10; // selected steps
  let maxSteps: number = 100;
  let stepsOptions: number[] = [1, 2, 3, 4, 5, 10, 15, 25, 50, 75, 100];

  // Duration timers
  let startTimer: Date;
  let endTimer: Date;
  let elapsed: number = 0;

  $: stableDiffusionDirectoryIsRegistered =
    stableDiffusionDirectoryInput &&
    stableDiffusionDirectoryInput.value.trim() !== "";

  $: {
    stableDiffusionCommand = `python scripts/txt2img.py --prompt "${prompt}" --n_samples 1 --n_iter 1 --plms --ddim_steps ${steps.toString()}`;
    stableDiffusionCommandHtml = `python scripts/txt2img.py --prompt <strong>"${prompt}"</strong> --n_samples 1 --n_iter 1 --plms --ddim_steps <strong>${steps}</strong>`;
  }

  $: {
    if (stableDiffusionDirectory) {
      stableDiffusionOutputDirectory = `${stableDiffusionDirectory}/outputs/txt2img-samples`;
    }
  }

  $: {
    if ($reusePrompt.length) {
      prompt = $reusePrompt;
    }
  }

  async function openDirectorySelectionDialog() {
    // Open a selection dialog for directories
    const selected = await openDialog({
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
    await set<directory>("stableDiffusionDirectory", stableDiffusionDirectory)
      .then(() => console.log("Stable Diffusion directory saved"))
      .catch((err) => console.log(err));
  }

  async function saveRun(run: Run) {
    runs.push(run);
  }

  async function generate() {
    if (stableDiffusionDirectory.trim() === "") return;
    if (stableDiffusionCommand.trim() === "") return;

    isGenerating = true;
    elapsed = 0;
    rustResponse = "";
    rustError = "";
    startTimer = new Date();

    const run: Run = {
      id: uuidv4(),
      prompt,
      steps: steps,
      started_at: startTimer,
      rating: Rating.One,
    };

    // Invoke the Stable Diffusion command
    await invoke("stable_diffusion_command", {
      directory: stableDiffusionDirectory,
      command: stableDiffusionCommand,
    })
      .then((res) => {
        rustResponse = JSON.stringify(res);

        run.image_name = "image.png"; // @todo use magic to get the image name
        run.image_path = stableDiffusionOutputDirectory;
      })
      .catch((err) => {
        rustError = JSON.stringify(err);
      })
      .finally(() => {
        isGenerating = false;
        endTimer = new Date();
        elapsed = endTimer - startTimer; // in ms

        run.ended_at = endTimer;
        run.elapsed = elapsed;

        saveRun(run);
      });
  }

  async function openDirectory(directory: string) {
    await open(`file://${directory}`);
  }

  function handleCustomSteps(event: Event) {
    // very hacky way of swapping input <-> select without losing the value
    useCustomSteps = event.target.selectedOptions[0].innerText === "custom";
  }

  onMount(async () => {
    await get<directory>("stableDiffusionDirectory")
      .then((directory) => {
        stableDiffusionDirectory = directory;
      })
      .catch((err) => {
        // do nothing, the user will have to set the directory
      });
  });
</script>

<section class="flex-1 flex flex-col gap-8">
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
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold">SD project:</span>
          <a
            href={`file://${stableDiffusionDirectory}`}
            class="font-mono text-xs text-blue-600 hover:underline"
            on:click|preventDefault={() =>
              openDirectory(stableDiffusionDirectory)}
            >{stableDiffusionDirectory}</a
          >
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold">SD output:</span>
          <a
            href={`file://${stableDiffusionOutputDirectory}`}
            class="font-mono text-xs text-blue-600 hover:underline"
            on:click|preventDefault={() =>
              openDirectory(stableDiffusionOutputDirectory)}
            >{stableDiffusionOutputDirectory}</a
          >
        </div>
      </div>
    {/if}
  </div>

  <div class="flex flex-col items-end gap-2">
    <textarea
      rows="5"
      cols="50"
      bind:value={prompt}
      {placeholder}
      class="w-full"
    />

    <label class="flex items-center gap-2">
      <span class="font-bold">Steps</span>

      {#if useCustomSteps}
        <input type="number" bind:value={steps} min="1" max={maxSteps} />
        <button
          class="p-0 bg-transparent hover:bg-transparent hover:border-transparent text-black/50 hover:text-black"
          on:click={() => {
            useCustomSteps = false;
            steps = defaultSteps;
          }}
          title="Switch to dropdown"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
        </button>
      {:else}
        <select bind:value={steps} on:change={handleCustomSteps}>
          {#each stepsOptions as option}
            <option value={option}>{option}</option>
          {/each}
          <option value="10">custom</option>
        </select>
      {/if}
    </label>

    <button
      class="w-full"
      disabled={!stableDiffusionDirectory ||
        prompt.trim() === "" ||
        isGenerating}
      on:click={generate}>{isGenerating ? "generating..." : "Generate!"}</button
    >

    {#if prompt.trim() !== ""}
      <Alert alertType={AlertTypes.Info}
        >{@html stableDiffusionCommandHtml}</Alert
      >
    {/if}

    {#if elapsed}
      <Alert>Elapsed: {elapsed / 1000}s</Alert>
    {/if}

    {#if rustResponse}
      {@const html = JSON.parse(rustResponse).replaceAll("\n", "<br>")}
      <Alert alertType={AlertTypes.Success}>{@html html}</Alert>
    {/if}

    {#if rustError}
      {@const html = JSON.parse(rustError).replaceAll("\n", "<br>")}
      <Alert alertType={AlertTypes.Error}>{@html html}</Alert>
    {/if}
  </div>
</section>

<style>
</style>
