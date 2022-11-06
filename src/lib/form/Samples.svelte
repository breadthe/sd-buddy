<script lang="ts">
  // store imports
  import { samples, maxSamples } from "../../store"

  // component imports
  import HelpBubble from "../HelpBubble.svelte"
  import WarningBubble from "../WarningBubble.svelte"
</script>

<label class="flex flex-col w-full">
  <div class="flex items-center gap-2">
    <span class="font-bold">Batch Size</span>

    <HelpBubble title="--n_samples : Number of samples to generate per prompt (stacked horizontally)." />

    <WarningBubble
      title="Use values greater than 1 at your own risk. It always crashes for me at 2, works fine at 3 and 4."
    />
  </div>
  <input type="number" bind:value={$samples} min="1" max={$maxSamples} />
</label>

<style>
</style>
