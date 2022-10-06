<script lang="ts">
  // store imports
  import { generate } from "../store"
  const { runFilter } = generate
</script>

<input
  type="text"
  placeholder="Filter by prompt"
  class="w-full max-w-sm"
  autocomplete="off"
  autocorrect="off"
  bind:value={$runFilter}
/>

<style>
</style>
