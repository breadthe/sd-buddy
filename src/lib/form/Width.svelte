<script lang="ts">
  // store imports
  import { width } from "../../store"
</script>

<label class="flex flex-col w-full">
  <span class="font-bold">Image Width</span>
  <!-- must be a multiple of 8 -->
  <input type="number" bind:value={$width} min="1" step="8" />
</label>

<style>
</style>
