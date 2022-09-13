<script lang="ts">
  import { invoke } from "@tauri-apps/api/tauri"
  import { v4 as uuidv4 } from "uuid"
  import { AlertTypes, Rating } from "./types"
  import type { Run } from "./types"
  import { runs, reusePrompt, stableDiffusionDirectory } from "./store"
  import Alert from "./lib/Alert.svelte"
  import HelpBubble from "./lib/HelpBubble.svelte"
  import RunItem from "./lib/RunItem.svelte"

  let stableDiffusionOutputDirectory: string = ""
  let stableDiffusionCommand: string = ""
  let stableDiffusionCommandHtml: string = ""
  let rustResponse: string = ""
  let rustError: string = ""

  // Flags
  let isGenerating: boolean = false
  let useCustomSteps: boolean = false

  // Form parameters:

  // prompt
  const placeholder = "a red juicy apple floating in outer space, like a planet"
  let prompt: string = ""

  // --ddim_steps
  let defaultSteps: number = 10 // --ddim_steps, default 50 (keeping it 10 because slow computer)
  let steps: number = defaultSteps // selected steps
  let maxSteps: number = 100
  let stepsOptions: number[] = [1, 2, 3, 4, 5, 10, 15, 25, 50, 75, 100]

  // --scale
  let defaultScale: number = 8 // --scale, default 7.5 but we round to 8
  let scale: number = defaultScale // selected scale (context free guidance)
  let maxScale: number = 20 // 1 is AI almost ignores prompt, 20 is "stick to my prompt"

  // --n_iter
  let defaultIter: number = 1 // --n_iter, default 1
  let iter: number = defaultIter // selected iter(ations?)
  let maxIter: number = 10 // no idea what it should be, go with 10 for now

  // --n_samples
  let defaultSamples: number = 1 // --n_samples, default 3
  let samples: number = defaultSamples // selected samples
  let maxSamples: number = 10 // no idea what it should be, go with 10 for now

  // --H
  let defaultHeight: number = 512 // --H default 512
  let height: number = defaultHeight // selected height

  // --W
  let defaultWidth: number = 512 // --W default 512
  let width: number = defaultWidth // selected width

  // --seed
  let defaultSeed: number = 42 // --seed default 42, set to -1 for random
  let seed: number = defaultSeed // selected seed
  let maxSeed: number = 4294967295
  let useRandomSeed: boolean = false
  // use the initial random seed when Random is checked for the first run, regenerate for subsequent runs
  $: if (useRandomSeed || (useRandomSeed && isGenerating && currentCopy > 1)) {
    seed = getRandomSeed()
  }

  // parameters for generating multiple images with the same settings
  let copiesOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  let defaultCopies: number = 1 // number of copies to generate
  let copies: number
  let currentCopy: number = 1

  // Duration timers
  let elapsed: number = 0 // in ms
  $: elapsedSeconds = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "unit",
    unit: "second",
  }).format(elapsed / 1000)

  let currentRun: Run // the currently generated run

  $: numPromptTokens = Math.ceil(prompt.length / 4) // very rough estimation https://www.reddit.com/r/StableDiffusion/comments/wl4cn3/the_maximum_usable_length_of_a_stable_diffusion/

  $: {
    stableDiffusionCommand = `python scripts/txt2img.py --prompt "${prompt}" --plms --n_samples ${samples?.toString()} --scale ${scale?.toString()} --n_iter ${iter?.toString()} --ddim_steps ${steps?.toString()} --H ${height?.toString()} --W ${width?.toString()} --seed ${seed?.toString()} --fixed_code`
    stableDiffusionCommandHtml = `python scripts/txt2img.py --prompt <strong>"${prompt}"</strong> --plms --n_samples <strong>${samples}</strong> --scale <strong>${scale}</strong> --n_iter <strong>${iter}</strong> --ddim_steps <strong>${steps}</strong> --H <strong>${height}</strong> --W <strong>${width}</strong> --seed <strong>${seed}</strong> --fixed_code`
  }

  $: {
    if ($stableDiffusionDirectory) {
      stableDiffusionOutputDirectory = `${$stableDiffusionDirectory}/outputs/txt2img-samples`
    }
  }

  $: if (Object.keys($reusePrompt).length) {
    prompt = $reusePrompt?.prompt ?? prompt
    steps = $reusePrompt?.steps ?? steps
    iter = $reusePrompt?.iter ?? iter
    samples = $reusePrompt?.samples ?? samples
    scale = $reusePrompt?.scale ?? scale
    seed = $reusePrompt?.seed ?? seed
    height = $reusePrompt?.height ?? height
    width = $reusePrompt?.width ?? width
    useRandomSeed = false
    copies = 1
    // Reset the prompt so we can modify the values.
    $reusePrompt = {} as Run
  }

  async function saveRun(run: Run) {
    runs.push(run)
  }

  // resets the form to its original state and clears the response alerts
  function resetForm() {
    reusePrompt.set(<Run>{})
    prompt = ""
    steps = defaultSteps
    samples = defaultSamples
    scale = defaultScale
    iter = defaultIter
    scale = defaultScale
    height = defaultHeight
    width = defaultWidth
    seed = defaultSeed
    useRandomSeed = false
    copies = defaultCopies
    isGenerating = false
    useCustomSteps = false
    elapsed = 0
    rustResponse = ""
    rustError = ""
    currentRun = null
  }

  // queue up multiple runs
  async function generate() {
    for (let i = 1; i <= copies; i++) {
      currentCopy = i
      console.log(`Queueing ${currentCopy}`)
      const result = await doTheWork(currentCopy)
      console.log(result)
    }
  }

  // generate a random seed between 0 and maxSeed
  const getRandomSeed = () => Math.floor(Math.random() * maxSeed)

  // generate a single run
  async function doTheWork(n: number) {
    if ($stableDiffusionDirectory.trim() === "") return
    if (stableDiffusionCommand.trim() === "") return

    isGenerating = true
    elapsed = 0
    rustResponse = ""
    rustError = ""
    currentRun = null

    // timer that runs every 100ms
    const startTimer = new Date()
    const timer = setInterval(() => {
      elapsed = Math.floor(new Date().getTime() - startTimer.getTime())
    }, 100)

    const run: Run = {
      id: uuidv4(),
      prompt,
      steps,
      samples,
      scale,
      iter,
      height,
      width,
      seed,
      started_at: startTimer,
      rating: Rating.One,
    }

    // Invoke the Stable Diffusion command
    await invoke("stable_diffusion_command", {
      directory: $stableDiffusionDirectory,
      command: stableDiffusionCommand,
    })
      .then(async (res) => {
        rustResponse = JSON.stringify(res)

        run.image_name = "image.png" // @todo use magic to get the image name
      })
      .catch((err) => {
        rustError = JSON.stringify(err)
      })
      .finally(() => {
        isGenerating = false

        clearInterval(timer)

        run.ended_at = new Date()
        run.elapsed = elapsed // in s
      })

    await getLatestImageFromOutputDirectory(elapsed).then((image_name) => {
      run.image_name = JSON.parse(image_name)
    })

    saveRun(run)

    currentRun = run

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(`done ${n}`)

        if (rustError) reject(rustError)
      }, 10)
    })
  }

  // Get the latest image from the output directory
  // We will assume that the latest image is the one we just generated
  async function getLatestImageFromOutputDirectory(
    elapsed: number
  ): Promise<string> {
    let latest_image = ""
    let seconds = Math.ceil(elapsed / 1000) + 10 // convert ms to seconds, add 10 seconds to be safe

    await invoke("get_latest_image", {
      dirPath: stableDiffusionOutputDirectory,
      elapsed: seconds.toString(),
    })
      .then((res) => {
        latest_image = JSON.stringify(res)
      })
      .catch((err) => {
        console.log(err)

        latest_image = ""
      })

    return latest_image
  }

  function handleCustomSteps(event: Event) {
    // very hacky way of swapping input <-> select without losing the value
    useCustomSteps = event.target.selectedOptions[0].innerText === "custom"
  }
</script>

<section class="flex gap-8">
  <!-- Left column: prompt + params -->
  <div class="flex-1 flex flex-col gap-4">
    <!-- Prompt -->
    <div class="w-full flex flex-col">
      <div class="flex justify-between">
        <label for="prompt" class="font-bold">
          Prompt
          {#if numPromptTokens > 75}
            <span class="text-red-600"
              >(estimated {numPromptTokens} tokens - max is ~77
              <a
                class="text-blue-600 hover:underline"
                href="https://www.reddit.com/r/StableDiffusion/comments/wl4cn3/the_maximum_usable_length_of_a_stable_diffusion/"
                target="_blank">source</a
              >)</span
            >
          {/if}
        </label>
        <button class="transparent" on:click={resetForm}>reset</button>
      </div>
      <textarea
        name="prompt"
        rows="5"
        cols="50"
        bind:value={prompt}
        {placeholder}
      />
    </div>

    <!-- Params -->
    <div class="flex flex-col gap-4">
      <div class="flex gap-4">
        <label class="flex flex-col w-full">
          <div class="flex items-center gap-2">
            <span class="font-bold">Steps</span>

            <HelpBubble
              title="--ddim_steps : Sampling steps, higher numbers produce more detailed images at the expense of processing time."
            />
          </div>

          {#if useCustomSteps}
            <div class="flex items-center gap-2">
              <input type="number" bind:value={steps} min="1" max={maxSteps} />
              <button
                class="transparent"
                on:click={() => {
                  useCustomSteps = false
                  steps = defaultSteps
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
            </div>
          {:else}
            <select bind:value={steps} on:change={handleCustomSteps}>
              {#each stepsOptions as option}
                <option value={option}>{option}</option>
              {/each}
              <option value="10">custom</option>
            </select>
          {/if}
        </label>

        <label class="flex flex-col w-full">
          <div class="flex items-center gap-2">
            <span class="font-bold">CFG Scale</span>

            <HelpBubble
              title={`--scale : Classifier Free Guidance Scale, how closely the image should resemble the prompt, 1-${maxScale}.`}
            />
          </div>

          <input type="number" bind:value={scale} min="1" max={maxScale} />
        </label>
      </div>

      <div class="flex gap-4">
        <label class="flex flex-col w-full">
          <div class="flex items-center gap-2">
            <span class="font-bold">Batch Count</span>

            <HelpBubble
              title="--n_iter : Number of images batches to generate (stacked vertically)."
            />
          </div>

          <input type="number" bind:value={iter} min="1" max={maxIter} />
        </label>

        <!-- most of us have OOM issues with this and this functionality is superceded by the Runs -->
        <label class="flex flex-col w-full">
          <div class="flex items-center gap-2">
            <span class="font-bold">Batch Size</span>

            <HelpBubble
              title="--n_samples : Number of samples to generate per prompt (stacked horizontally)."
            />
          </div>
          <input
            type="number"
            disabled
            class="opacity-30"
            bind:value={samples}
            min="1"
            max={maxSamples}
          />
        </label>
      </div>

      <div class="flex gap-4">
        <label class="flex flex-col w-full">
          <span class="font-bold">Image Height</span>
          <!-- must be a multiple of 8 -->
          <input type="number" bind:value={height} min="1" step="8" />
        </label>

        <label class="flex flex-col w-full">
          <span class="font-bold">Image Width</span>
          <!-- must be a multiple of 8 -->
          <input type="number" bind:value={width} min="1" step="8" />
        </label>
      </div>

      {#if width !== 512 && height !== 512}
        <div class="flex flex-col">
          <span class="font-bold">Dimension validation warning</span>
          <span class="text-red-600"
            >Either Height or Width should be 512 for best results (<a
              class="text-blue-600 hover:underline"
              href="https://huggingface.co/blog/stable_diffusion"
              target="_blank">source</a
            >)</span
          >
        </div>
      {/if}

      <div class="flex items-center justify-between gap-4">
        <label class="flex flex-col w-full">
          <div class="flex items-center gap-2">
            <span class="font-bold">Seed</span>

            <HelpBubble title={`--seed : -1 to randomize, max ${maxSeed}.`} />
          </div>

          <input
            type="number"
            bind:value={seed}
            disabled={useRandomSeed}
            class:opacity-30={useRandomSeed}
            min="-1"
            max={maxSeed}
          />
        </label>

        <label class="flex flex-col text-right w-full">
          <div class="flex items-center gap-2">
            <span class="font-bold">Random</span>

            <HelpBubble
              title={`Using seed=-1 for a random seed does not tell you what the value is. If you want to have a record of what seed was used, check this option to get a random seed between 1-${maxSeed}.`}
            />
          </div>

          <input
            type="checkbox"
            bind:checked={useRandomSeed}
            class="my-2 border"
          />
        </label>
      </div>
    </div>

    <div class="flex items-center justify-between gap-4">
      <!-- Generate button -->
      <button
        class="w-full"
        disabled={!$stableDiffusionDirectory ||
          prompt.trim() === "" ||
          numPromptTokens > 80 || // giving user a bit more leeway than strictly 75 since we're estimating
          isGenerating}
        on:click={generate}
        >{isGenerating
          ? `generating${copies > 1 ? ` ${currentCopy}/${copies}` : ""}...`
          : "Generate!"}</button
      >

      <select
        bind:value={copies}
        title="Generate this many images with the same settings"
      >
        {#each copiesOptions as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>

    {#if prompt.trim() !== ""}
      <Alert alertType={AlertTypes.Info} copy
        >{@html stableDiffusionCommandHtml}</Alert
      >
    {/if}
  </div>

  <!-- Right column: generated image -->
  <div class="flex flex-col gap-4">
    <!-- Image + timer -->
    <div
      class="flex items-center justify-center border border-blue-500/50 rounded w-[512px] h-[512px] mt-6"
    >
      {#if currentRun}
        <RunItem run={currentRun} imageOnly />
      {:else if elapsed}
        <span class="tabular-nums">{elapsedSeconds}</span>
      {:else}
        <span class="text-black/50 dark:text-white/50"
          >the image will be generated here</span
        >
      {/if}
    </div>

    <!-- Alerts -->
    <div class="flex flex-col gap-4 max-w-[512px]">
      {#if elapsed && currentRun}
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
  </div>
</section>

<style>
</style>
