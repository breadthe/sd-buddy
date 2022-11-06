<script lang="ts">
  // store imports
  import { seed, maxSeed, useRandomSeed } from "../../store"

  // component imports
  import HelpBubble from "../HelpBubble.svelte"
</script>

<label class="flex flex-col w-full">
  <div class="flex items-center gap-2">
    <span class="font-bold">Seed</span>

    <HelpBubble title={`--seed : -1 to randomize, max ${$maxSeed}.`} />
  </div>

  <input
    type="number"
    bind:value={$seed}
    disabled={$useRandomSeed}
    class:opacity-30={$useRandomSeed}
    min="-1"
    max={$maxSeed}
  />
</label>

<style>
</style>
