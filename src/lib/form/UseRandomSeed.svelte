<script lang="ts">
  // store imports
  import { maxSeed, useRandomSeed } from "../../store"

  // component imports
  import HelpBubble from "../HelpBubble.svelte"
</script>

<div class="flex flex-col text-right w-full">
  <div class="flex items-center gap-2">
    <label for="randomSeed" class="font-bold">Random Seed</label>

    <HelpBubble
      title={`Using seed=-1 for a random seed does not tell you what the value is. If you want to have a record of what seed was used, check this option to get a random seed between 1-${$maxSeed}.`}
    />
  </div>

  <input id="randomSeed" type="checkbox" bind:checked={$useRandomSeed} class="my-2 border" />
</div>

<style>
</style>
