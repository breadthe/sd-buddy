<script lang="ts">
    import { invoke } from "@tauri-apps/api/tauri";
    import { v4 as uuidv4 } from "uuid";
    import { AlertTypes, Rating } from "./types";
    import type { Run } from "./types";
    import { runs, reusePrompt, stableDiffusionDirectory } from "./store";
    import Alert from "./lib/Alert.svelte";
    import RegisterProjectDirectory from "./RegisterProjectDirectory.svelte";

  type directory = {
    stableDiffusionDirectory: string;
  };

  /*
  --ddim_steps 1 (0.6s)
  --ddim_steps 10 (6s)
  --ddim_steps 50 (30s) default
  --ddim_steps 100 (1m) 2m on M1 Pro
  */
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

  $: {
    stableDiffusionCommand = `python scripts/txt2img.py --prompt "${prompt}" --n_samples 1 --n_iter 1 --plms --ddim_steps ${steps.toString()}`;
    stableDiffusionCommandHtml = `python scripts/txt2img.py --prompt <strong>"${prompt}"</strong> --n_samples 1 --n_iter 1 --plms --ddim_steps <strong>${steps}</strong>`;
  }

  $: {
    if ($stableDiffusionDirectory) {
      stableDiffusionOutputDirectory = `${$stableDiffusionDirectory}/outputs/txt2img-samples`;
    }
  }

  $: {
    if ($reusePrompt.length) {
      prompt = $reusePrompt;
    }
  }

  async function saveRun(run: Run) {
    runs.push(run);
  }

  // resets the form to its original state and clears the response alerts
  function resetForm() {
    prompt = "";
    steps = defaultSteps;
    isGenerating = false;
    useCustomSteps = false;
    startTimer = null;
    endTimer = null;
    elapsed = 0;
    rustResponse = "";
    rustError = "";
  }

  async function generate() {
    if ($stableDiffusionDirectory.trim() === "") return;
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
      directory: $stableDiffusionDirectory,
      command: stableDiffusionCommand,
    })
      .then((res) => {
        rustResponse = JSON.stringify(res);

        run.image_name = "image.png"; // @todo use magic to get the image name
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

  function handleCustomSteps(event: Event) {
    // very hacky way of swapping input <-> select without losing the value
    useCustomSteps = event.target.selectedOptions[0].innerText === "custom";
  }
</script>

<section class="flex-1 flex flex-col">
  <RegisterProjectDirectory />

  <div class="flex flex-col items-end gap-2">
    <button class="transparent" on:click={resetForm}>reset</button>

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
          class="transparent"
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
      disabled={!$stableDiffusionDirectory ||
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
