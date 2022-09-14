<script lang="ts">
  import { customVars, extractedVars, promptStrings } from "../store"
  import CustomVar from "./CustomVar.svelte"

  // validate if all the custom vars are populated with at least 1 value
  $: allCustomVarsAreFilled = $extractedVars.every((ev) =>
    $customVars.find((cv) => `$${cv.name}` === ev[0] && cv.values.length)
  )
</script>

{#if $extractedVars.length}
  <div class="flex flex-col gap-4 p-2 border border-blue-500 rounded">
    <span class="font-bold">Prompt Parameters detected</span>

    <div class="flex flex-col gap-2">
      {#each $extractedVars as extractedVar}
        {@const sanitizedVar = extractedVar.toString().replace("$", "")}
        <CustomVar name={sanitizedVar} />
      {/each}
    </div>

    {#if $promptStrings.length}
      <p>
        <strong>{$promptStrings.length}</strong> prompt variations
        {#if !allCustomVarsAreFilled}
          <strong class="text-red-600">incomplete</strong>
        {/if}
      </p>
      <div class="max-h-32 overflow-auto">
        {#each $promptStrings as promptString}
          <div>
            {promptString.toString()}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
</style>
