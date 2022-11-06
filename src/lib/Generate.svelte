<script lang="ts">
  // system/lib/util imports
  import { invoke } from "@tauri-apps/api/tauri"
  import { v4 as uuidv4 } from "uuid"

  // type imports
  import { AlertTypes, Rating } from "../types"
  import type { Run } from "../types"

  // store imports
  import {
    // generate params
    prompt,
    isGenerating,
    currentRun,
    elapsed,
    customVars,
    extractedVars,
    promptStrings,
    runs,
    reusePrompt,
    stableDiffusionDirectory,
    allCustomVarsAreFilled,
    pythonPath,

    // form params
    defaultSteps,
    steps,
    useCustomSteps,
    defaultScale,
    scale,
    defaultIter,
    iter,
    defaultSamples,
    samples,
  } from "../store"

  // component imports
  import Alert from "./Alert.svelte"
  import HelpBubble from "./HelpBubble.svelte"
  import RunItem from "./RunItem.svelte"
  import Prompt from "./form/Prompt.svelte"
  import PromptMatrix from "./form/PromptMatrix.svelte"
  import Steps from "./form/Steps.svelte"
  import Scale from "./form/Scale.svelte"
  import Iter from "./form/Iter.svelte"
  import Samples from "./form/Samples.svelte"

  let stableDiffusionOutputDirectory: string = ""
  let stableDiffusionCommand: string = ""
  let stableDiffusionCommandHtml: string = ""
  let rustResponse: string = ""
  let rustError: string = ""

  // Form parameters:

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
  $: if (useRandomSeed || (useRandomSeed && $isGenerating && currentCopy > 1)) {
    seed = getRandomSeed()
  }

  // parameters for generating multiple images with the same settings
  let copiesOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  let defaultCopies: number = 1 // number of copies to generate
  let copies: number
  let currentCopy: number = 1

  // Duration timers
  $: elapsedSeconds = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "unit",
    unit: "second",
  }).format($elapsed / 1000)

  $: numPromptTokens = Math.ceil($prompt.length / 4) // very rough estimation https://www.reddit.com/r/StableDiffusion/comments/wl4cn3/the_maximum_usable_length_of_a_stable_diffusion/

  $: {
    stableDiffusionCommand = `${$pythonPath} scripts/txt2img.py --prompt "${$prompt}" --plms --n_samples ${$samples?.toString()} --scale ${$scale?.toString()} --n_iter ${$iter?.toString()} --ddim_steps ${$steps?.toString()} --H ${height?.toString()} --W ${width?.toString()} --seed ${seed?.toString()} --fixed_code`
    stableDiffusionCommandHtml = `${$pythonPath} scripts/txt2img.py --prompt <strong>"${$prompt}"</strong> --plms --n_samples <strong>${$samples}</strong> --scale <strong>${$scale}</strong> --n_iter <strong>${$iter}</strong> --ddim_steps <strong>${$steps}</strong> --H <strong>${height}</strong> --W <strong>${width}</strong> --seed <strong>${seed}</strong> --fixed_code`
  }

  $: {
    if ($stableDiffusionDirectory) {
      stableDiffusionOutputDirectory = `${$stableDiffusionDirectory}/outputs/txt2img-samples`
    }
  }

  // reset parameters when reusing a prompt
  $: if (Object.keys($reusePrompt).length) {
    prompt.set($reusePrompt?.prompt ?? $prompt)
    steps.set($reusePrompt?.steps ?? $steps)
    iter.set($reusePrompt?.iter ?? $iter)
    samples.set($reusePrompt?.samples ?? $samples)
    scale.set($reusePrompt?.scale ?? $scale)
    seed = $reusePrompt?.seed ?? seed
    height = $reusePrompt?.height ?? height
    width = $reusePrompt?.width ?? width
    useRandomSeed = false
    copies = 1
    $reusePrompt = {} as Run // Reset the prompt so we can modify the values.
    resetPromptMatrix()
  }

  // disable the Generate button when these conditions are met
  $: disableGenerate =
    !$stableDiffusionDirectory || // no stable diffusion directory
    !$pythonPath || // python path is not set
    $prompt.trim() === "" || // prompt is empty
    numPromptTokens > 80 || // giving user a bit more leeway than strictly 75 since we're estimating
    $isGenerating || // disable while generating
    // if there are custom vars, make sure they're all filled
    ($extractedVars.length && !$allCustomVarsAreFilled)

  async function saveRun(run: Run) {
    runs.push(run)
  }

  // resets the form to its original state and clears the response alerts
  function resetForm() {
    reusePrompt.set(<Run>{})
    prompt.set("")
    steps.set($defaultSteps)
    samples.set($defaultSamples)
    scale.set($defaultScale)
    iter.set($defaultIter)
    height = defaultHeight
    width = defaultWidth
    seed = defaultSeed
    useRandomSeed = false
    copies = defaultCopies
    isGenerating.set(false)
    useCustomSteps.set(false)
    elapsed.set(0)
    rustResponse = ""
    rustError = ""
    currentRun.set(null)
    resetPromptMatrix()
  }

  function resetPromptMatrix() {
    customVars.set([])
    // promptStrings.set([])
    // extractedVars.set([])
  }

  // queue up multiple runs
  async function runPythonCommand() {
    // if there is a prompt matrix, process it
    if ($extractedVars.length && $allCustomVarsAreFilled) {
      const tmpPromptStrings = $promptStrings
      currentCopy = 1
      while (tmpPromptStrings.length > 0) {
        // extract prompt strings randomly from the matrix
        const ix = Math.floor(Math.random() * tmpPromptStrings.length)
        const promptString = tmpPromptStrings[ix]
        stableDiffusionCommand = `${$pythonPath} scripts/txt2img.py --prompt "${promptString}" --plms --n_samples ${$samples?.toString()} --scale ${$scale?.toString()} --n_iter ${$iter?.toString()} --ddim_steps ${$steps?.toString()} --H ${height?.toString()} --W ${width?.toString()} --seed ${seed?.toString()} --fixed_code`
        console.log(`Queueing ${currentCopy}`)
        const result = await doTheWork(promptString, stableDiffusionCommand, currentCopy)
        tmpPromptStrings.splice(ix, 1)
        currentCopy++
        console.log(result)
      }
    } else {
      // regular prompt
      for (let i = 1; i <= copies; i++) {
        currentCopy = i
        console.log(`Queueing ${currentCopy}`)
        const result = await doTheWork($prompt, stableDiffusionCommand, currentCopy)
        console.log(result)
      }
    }
  }

  // generate a random seed between 0 and maxSeed
  const getRandomSeed = () => Math.floor(Math.random() * maxSeed)

  // generate a single run
  async function doTheWork(prompt: string, command: string, n: number) {
    if ($stableDiffusionDirectory.trim() === "") return
    if (command.trim() === "") return

    isGenerating.set(true)
    elapsed.set(0)
    rustResponse = ""
    rustError = ""
    currentRun.set(null)

    // timer that runs every 100ms
    const startTimer = new Date()
    const timer = setInterval(() => {
      elapsed.set(Math.floor(new Date().getTime() - startTimer.getTime()))
    }, 100)

    const run: Run = {
      id: uuidv4(),
      prompt,
      steps: $steps,
      samples: $samples,
      scale: $scale,
      iter: $iter,
      height,
      width,
      seed,
      started_at: startTimer,
      rating: Rating.One,
    }

    // Invoke the Stable Diffusion command
    await invoke("stable_diffusion_command", {
      directory: $stableDiffusionDirectory,
      command,
    })
      .then(async (res) => {
        rustResponse = JSON.stringify(res)

        run.image_name = "image.png" // @todo use magic to get the image name
      })
      .catch((err) => {
        rustError = JSON.stringify(err)
      })
      .finally(() => {
        isGenerating.set(false)

        clearInterval(timer)

        run.ended_at = new Date()
        run.elapsed = $elapsed // in s
      })

    await getLatestImageFromOutputDirectory($elapsed).then((image_name) => {
      run.image_name = JSON.parse(image_name)
    })

    saveRun(run)

    currentRun.set(run)

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(`done ${n}`)

        if (rustError) reject(rustError)
      }, 10)
    })
  }

  // Get the latest image from the output directory
  // We will assume that the latest image is the one we just generated
  async function getLatestImageFromOutputDirectory(elapsed: number): Promise<string> {
    let latest_image = ""

    // @deprecated - this is a hack to get the latest image
    let seconds = Math.ceil(elapsed / 1000) + 10 // convert ms to seconds, add 10 seconds to be safe

    await invoke("get_latest_image", {
      dirPath: stableDiffusionOutputDirectory,
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
</script>

<section class="flex gap-8">
  <!-- Left column: prompt + params -->
  <div class="flex-1 flex flex-col gap-4">
    <!-- Prompt -->
    <div class="w-full flex flex-col">
      <div class="flex justify-between">
        <label for="prompt" class="font-bold">
          <div class="flex items-center gap-2">
            <span class="font-bold">Prompt</span>

            <HelpBubble title="--prompt : Text prompt. Use $custom $parameters to generate a prompt matrix." />
          </div>

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
        <button class="btn-transparent" on:click={resetForm}>reset</button>
      </div>

      <Prompt />
    </div>

    <!-- Prompt Matrix  -->
    <PromptMatrix />

    <!-- Params -->
    <div class="flex flex-col gap-4">
      <div class="flex gap-4">
        <Steps />

        <Scale />
      </div>

      <div class="flex gap-4">
        <Iter />

        <Samples />
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

        <!-- <label class="flex flex-col text-right w-full"> -->
        <div class="flex flex-col text-right w-full">
          <div class="flex items-center gap-2">
            <label for="randomSeed" class="font-bold">Random</label>

            <HelpBubble
              title={`Using seed=-1 for a random seed does not tell you what the value is. If you want to have a record of what seed was used, check this option to get a random seed between 1-${maxSeed}.`}
            />
          </div>

          <input id="randomSeed" type="checkbox" bind:checked={useRandomSeed} class="my-2 border" />
        </div>
        <!-- </label> -->
      </div>
    </div>

    <div class="flex items-center justify-between gap-4">
      <!-- Generate button -->
      <button class="w-full" disabled={disableGenerate} on:click={runPythonCommand}>
        {#if $isGenerating}
          {#if $promptStrings}
            {`generating prompt ${currentCopy}/${$promptStrings.length + currentCopy - 1}...`}
          {:else}
            {`generating${copies > 1 ? ` copy ${currentCopy}/${copies}` : ""}...`}
          {/if}
        {:else}
          Generate
        {/if}
      </button>

      <select bind:value={copies} title="Generate this many images with the same settings">
        {#each copiesOptions as option (option)}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </div>

    {#if $prompt.trim() !== ""}
      <Alert alertType={AlertTypes.Info} copy>{@html stableDiffusionCommandHtml}</Alert>
    {/if}
  </div>

  <!-- Right column: generated image -->
  <div class="flex flex-col gap-4">
    <!-- Image + timer -->
    <div class="flex items-center justify-center border border-blue-500/50 rounded w-[512px] h-[512px] mt-6">
      {#if $currentRun}
        <RunItem run={$currentRun} imageOnly />
      {:else if $elapsed}
        <span class="tabular-nums">{elapsedSeconds}</span>
      {:else}
        <span class="text-black/50 dark:text-white/50">the image will be generated here</span>
      {/if}
    </div>

    <!-- Alerts -->
    <div class="flex flex-col gap-4 max-w-[512px]">
      {#if $elapsed && $currentRun}
        <Alert>Elapsed: {$elapsed / 1000}s</Alert>
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
