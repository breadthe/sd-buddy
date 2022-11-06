<script lang="ts">
  // store imports
  import { height } from "../../store"
</script>

<label class="flex flex-col w-full">
  <span class="font-bold">Image Height</span>
  <!-- must be a multiple of 8 -->
  <input type="number" bind:value={$height} min="1" step="8" />
</label>

<style>
</style>
