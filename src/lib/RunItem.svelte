<script lang="ts">
  import type { Run } from "../types";

  export let run: Run;
</script>

<div class="flex flex-col divide-y divide-blue-600/50 border border-blue-500/50 rounded">
  <dl class="p-2 text-xs">
    <dt class="font-bold">prompt</dt>
    <dd>{run.prompt}</dd>
  </dl>

  <dl class="p-2 grid grid-cols-2 text-xs">
    <!-- <dt class="font-bold">id</dt><dd>{run.id}</dd> -->
    <dt class="font-bold">steps</dt>
    <dd>{run.steps}</dd>
    <dt class="font-bold">elapsed</dt>
    <dd>{run.elapsed / 1000}s</dd>
  </dl>
</div>

<style>
</style>
