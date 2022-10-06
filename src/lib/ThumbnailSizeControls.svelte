<script lang="ts">
  // system/lib/util imports
  import { tooltip } from "../tooltip"
  import { isDark } from "../utils"

  // store imports
  import { system } from "../store"
  const { thumbnailSize } = system
</script>

<div class="isolate inline-flex border border-gray-500 rounded">
  <button
    class="control-btn"
    use:tooltip={{ theme: isDark() ? "dark-border" : "light-border" }}
    on:click={() => thumbnailSize.decrease()}
    title="Decrease thumbnail size"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="3"
      stroke="currentColor"
      class="w-4 h-4"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
    </svg>
  </button>
  <button
    class="control-btn"
    use:tooltip={{ theme: isDark() ? "dark-border" : "light-border" }}
    on:click={() => thumbnailSize.increase()}
    title="Increase thumbnail size"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="3"
      stroke="currentColor"
      class="w-4 h-4"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  </button>
</div>

<style>
</style>
