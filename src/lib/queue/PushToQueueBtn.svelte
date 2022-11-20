<script lang="ts">
  // system/lib/util imports
  import { v4 as uuidv4 } from "uuid"
  import { tooltip } from "../../tooltip"
  import { isDark, getRandomSeed } from "../../utils"

  // type imports
  import { QueueItemStatus, Rating } from "../../types"

  // store imports
  import {
    queue,

    // generate params
    isGenerating,
    currentRun,
    elapsed,
    customVars,
    extractedVars,
    promptStrings,
    reusePrompt,
    allCustomVarsAreFilled,

    // form params
    prompt,
    steps,
    scale,
    iter,
    samples,
    height,
    width,
    seed,
    maxSeed,
    useRandomSeed,
  } from "../../store"

  export let disableEnqueue: boolean = false
  export let copies: number = 1

  function pushToQueue() {
    // if there is a prompt matrix, push each prompt to the queue in random order
    if ($extractedVars.length && $allCustomVarsAreFilled) {
      const tmpPromptStrings = $promptStrings
      while (tmpPromptStrings.length > 0) {
        // extract prompt strings randomly from the matrix
        const ix = Math.floor(Math.random() * tmpPromptStrings.length)
        const promptString = tmpPromptStrings[ix]

        // build the run object (queue item)
        const queueItem = {
          id: uuidv4(),

          run: {
            id: uuidv4(),
            prompt: promptString,
            steps: $steps,
            samples: $samples,
            scale: $scale,
            iter: $iter,
            height: $height,
            width: $width,
            seed: $useRandomSeed ? getRandomSeed($maxSeed) : $seed,
            started_at: new Date(),
            rating: Rating.One,
          },
          status: QueueItemStatus.Pending,
          started_at: new Date(),
        }

        // push the queue item to the queue
        queue.push(queueItem)

        // remove the prompt string from the matrix now that we're done with it
        tmpPromptStrings.splice(ix, 1)
      }
    } else {
      // @todo how to handle clicking multiple times on the + (add to queue) button? should we disable it?
      // maybe it should watch the prompt and if it's the same as the last one, disable it
      // -> this could be done by comparing a hash of the prompt and all the params

      for (let i = 1; i <= copies; i++) {
        // build the run object (queue item)
        const queueItem = {
          id: uuidv4(),

          run: {
            id: uuidv4(),
            prompt: $prompt,
            steps: $steps,
            samples: $samples,
            scale: $scale,
            iter: $iter,
            height: $height,
            width: $width,
            seed: $seed,
            started_at: new Date(),
            rating: Rating.One,
          },
          status: QueueItemStatus.Pending,
          started_at: new Date(),
        }

        // push the queue item to the queue
        queue.push(queueItem)
      }
    }
  }
</script>

<button
  class="flex items-center"
  disabled={disableEnqueue}
  on:click={pushToQueue}
  title="Push the current prompt or prompt matrix to the queue"
  use:tooltip={{ theme: isDark() ? "dark-border" : "light-border" }}
>
  <span class="">Enqueue</span>
</button>

<style>
</style>
