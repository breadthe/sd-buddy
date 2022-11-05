<script lang="ts">
  // store imports
  import { scale, maxScale } from "../../store"

  // component imports
  import HelpBubble from "../HelpBubble.svelte"
</script>

<label class="flex flex-col w-full">
  <div class="flex items-center gap-2">
    <span class="font-bold">CFG Scale</span>

    <HelpBubble
      title={`--scale : Classifier Free Guidance Scale, how closely the image should resemble the prompt, 1-${$maxScale}.`}
    />
  </div>

  <input type="number" bind:value={$scale} min="1" max={$maxScale} />
</label>

<style>
</style>
