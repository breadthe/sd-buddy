<script lang="ts">
  // system/lib/util imports
  import { createEventDispatcher } from "svelte"

  // store imports
  import { prompt, customVars, extractedVars } from "../../store"

  // component imports
  import HelpBubble from "../HelpBubble.svelte"

  export let numPromptTokens: number

  const dispatch = createEventDispatcher()
  const placeholder = "a red juicy apple floating in outer space, like a planet"

  // watch extractedVars, when the values change, update customVars
  $: {
    const cv = []
    $extractedVars.forEach((ev) => {
      const name = ev.slice(1) // "age", after removing $ from "$age"

      // skip if the current "name" key already exists in customVars
      const ix = $customVars.findIndex((cv) => cv.name === name)
      if (ix >= 0) {
        cv.push({ name, values: $customVars[ix].values })
      } else {
        cv.push({ name, values: null })
      }
    })
    customVars.set(cv)
  }
</script>

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
    <button class="btn-transparent" on:click={() => dispatch("resetForm")}>reset</button>
  </div>

  <textarea rows="5" cols="50" {placeholder} bind:value={$prompt} autocomplete="off" autocorrect="off" />
</div>
