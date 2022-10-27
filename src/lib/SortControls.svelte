<script lang="ts">
  // system/lib/util imports
  import { tooltip } from "../tooltip"
  import { isDark } from "../utils"

  // store imports
  import { runSortOrder } from "../store"
</script>

<div class="isolate inline-flex border border-gray-500 rounded">
  <button
    class="control-btn"
    class:active={$runSortOrder === "asc"}
    use:tooltip={{ theme: isDark() ? "dark-border" : "light-border" }}
    on:click={() => runSortOrder.set("asc")}
    title="Sort ascending"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="3"
      stroke="currentColor"
      class="w-4 h-4"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"
      />
    </svg>
  </button>
  <button
    class="control-btn"
    class:active={$runSortOrder === "desc"}
    use:tooltip={{ theme: isDark() ? "dark-border" : "light-border" }}
    on:click={() => runSortOrder.set("desc")}
    title="Sort descending"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="3"
      stroke="currentColor"
      class="w-4 h-4"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
      />
    </svg>
  </button>
</div>

<style>
</style>
