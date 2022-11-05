<script lang="ts">
  // store imports
  import { iter, maxIter } from "../../store"

  // component imports
  import HelpBubble from "../HelpBubble.svelte"
</script>

<label class="flex flex-col w-full">
  <div class="flex items-center gap-2">
    <span class="font-bold">Batch Count</span>

    <HelpBubble title="--n_iter : Number of images batches to generate (stacked vertically)." />
  </div>

  <input type="number" bind:value={$iter} min="1" max={$maxIter} />
</label>

<style>
</style>
