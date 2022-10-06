<script lang="ts">
  // component imports
  import FilterControls from "./FilterControls.svelte"
  import SortControls from "./SortControls.svelte"
  import ThumbnailSizeControls from "./ThumbnailSizeControls.svelte"
</script>

<nav class="flex-1 flex justify-end gap-2 w-full">
  <ThumbnailSizeControls />

  <SortControls />

  <FilterControls />
</nav>

<style>
</style>
