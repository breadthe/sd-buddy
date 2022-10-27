<script lang="ts">
  // store imports
  import { runFilter } from "../store"
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
