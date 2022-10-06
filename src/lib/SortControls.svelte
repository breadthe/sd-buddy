<script lang="ts">
  // system/lib/util imports
  import { tooltip } from "../tooltip"
  import { isDark } from "../utils"

  // store imports
  import { generate } from "../store"
  const { runSortOrder } = generate
</script>

<div class="isolate inline-flex border border-gray-500 rounded">
  <button
    class="control-btn"
    class:active={$runSortOrder === "asc"}
    use:tooltip={{ theme: isDark() ? "dark-border" : "light-border" }}
    on:click={() => runSortOrder.set("asc")}
    title="Sort ascending">&uparrow;</button
  >
  <button
    class="control-btn"
    class:active={$runSortOrder === "desc"}
    use:tooltip={{ theme: isDark() ? "dark-border" : "light-border" }}
    on:click={() => runSortOrder.set("desc")}
    title="Sort descending">&downarrow;</button
  >
</div>

<style>
</style>
