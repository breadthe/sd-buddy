<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri";
  import { v4 as uuidv4 } from "uuid";
  import { AlertTypes, Rating } from "./types";
  import type { Run } from "./types";
  import { runs, reusePrompt, stableDiffusionDirectory } from "./store";
  import Alert from "./lib/Alert.svelte";
  import RegisterProjectDirectory from "./lib/RegisterProjectDirectory.svelte";

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
  let defaultSteps: number = 10; // --ddim_steps, default 50
  let steps: number = defaultSteps; // selected steps
  let maxSteps: number = 100;
  let stepsOptions: number[] = [1, 2, 3, 4, 5, 10, 15, 25, 50, 75, 100];
  let defaultSamples: number = 1; // --n_samples, default 3
  let samples: number = defaultSamples; // selected samples
  let maxSamples: number = 10; // no idea what is should be, go with 10 for now
  let defaultHeight: number = 512; // --H default 512
  let height: number = defaultHeight; // selected height
  let defaultWidth: number = 512; // --W default 512
  let width: number = defaultWidth; // selected width
  let defaultSeed: number = 42; // --seed default 42, set to -1 for random
  let seed: number = defaultSeed; // selected seed
  let maxSeed: number = 4294967295;

  // Duration timers
  let elapsed: number = 0; // in ms

  $: {
    stableDiffusionCommand = `python scripts/txt2img.py --prompt "${prompt}" --n_samples ${samples.toString()} --n_iter 1 --plms --ddim_steps ${steps.toString()} --H ${height.toString()} --W ${width.toString()} --seed ${seed.toString()}`;
    stableDiffusionCommandHtml = `python scripts/txt2img.py --prompt <strong>"${prompt}"</strong> --n_samples <strong>${samples}</strong> --n_iter 1 --plms --ddim_steps <strong>${steps}</strong> --H <strong>${height}</strong> --W <strong>${width}</strong> --seed <strong>${seed}</strong>`;
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
    reusePrompt.set("");
    prompt = "";
    steps = defaultSteps;
    samples = defaultSamples;
    height = defaultHeight;
    width = defaultWidth;
    seed = defaultSeed;
    isGenerating = false;
    useCustomSteps = false;
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

    // timer that runs every 100ms
    const startTimer = new Date();
    const timer = setInterval(() => {
      elapsed = Math.floor(new Date().getTime() - startTimer.getTime());
    }, 100);

    const run: Run = {
      id: uuidv4(),
      prompt,
      steps,
      samples,
      height,
      width,
      seed,
      started_at: startTimer,
      rating: Rating.One,
    };

    // Invoke the Stable Diffusion command
    await invoke("stable_diffusion_command", {
      directory: $stableDiffusionDirectory,
      command: stableDiffusionCommand,
    })
      .then(async (res) => {
        rustResponse = JSON.stringify(res);

        run.image_name = "image.png"; // @todo use magic to get the image name
      })
      .catch((err) => {
        rustError = JSON.stringify(err);
      })
      .finally(() => {
        isGenerating = false;

        clearInterval(timer);

        run.ended_at = new Date();
        run.elapsed = elapsed; // in s
      });

    await getLatestImageFromOutputDirectory(elapsed).then((image_name) => {
      run.image_name = JSON.parse(image_name);
    });

    saveRun(run);
  }

  // Get the latest image from the output directory
  // We will assume that the latest image is the one we just generated
  async function getLatestImageFromOutputDirectory(
    elapsed: number
  ): Promise<string> {
    let latest_image = "";
    let seconds = Math.ceil(elapsed / 1000) + 10; // convert ms to seconds, add 10 seconds to be safe

    await invoke("get_latest_image", {
      dirPath: stableDiffusionOutputDirectory,
      elapsed: seconds.toString(),
    })
      .then((res) => {
        latest_image = JSON.stringify(res);
      })
      .catch((err) => {
        console.log(err);

        latest_image = "";
      });

    return latest_image;
  }

  function handleCustomSteps(event: Event) {
    // very hacky way of swapping input <-> select without losing the value
    useCustomSteps = event.target.selectedOptions[0].innerText === "custom";
  }
</script>

<section class="flex-1 flex flex-col gap-4">
  <RegisterProjectDirectory />

  <div class="flex flex-col items-end gap-2">
    <label class="w-full flex flex-col">
      <div class="flex justify-between">
        <span class="font-bold">Prompt</span>
        <button class="transparent" on:click={resetForm}>reset</button>
      </div>
      <textarea rows="5" cols="50" bind:value={prompt} {placeholder} />
    </label>

    <div class="flex gap-8">
      <label class="flex flex-col">
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

      <label class="flex flex-col">
        <span class="font-bold">Samples</span>

        <input type="number" bind:value={samples} min="1" max={maxSamples} />
      </label>

      <label class="flex flex-col">
        <span class="font-bold">Image Height</span>

        <input type="number" bind:value={height} min="1" class="w-32" />
      </label>

      <label class="flex flex-col">
        <span class="font-bold">Image Weight</span>

        <input type="number" bind:value={width} min="1" class="w-32" />
      </label>

      <label class="flex flex-col">
        <span class="font-bold">Seed</span>

        <input type="number" bind:value={seed} min="-1" max={maxSeed} />
      </label>
    </div>

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
