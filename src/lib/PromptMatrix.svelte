<script lang="ts">
  // store imports
  import { generate } from "../store"
  const { extractedVars, promptStrings, allCustomVarsAreFilled } = generate

  // component imports
  import CustomVar from "./CustomVar.svelte"
</script>

{#if $extractedVars.length}
  <div class="flex flex-col gap-4 p-2 border border-blue-500 rounded">
    <span class="font-bold">Prompt Parameters detected</span>

    <div class="flex flex-col gap-2">
      {#each $extractedVars as extractedVar (extractedVar)}
        {@const sanitizedVar = extractedVar.toString().replace("$", "")}
        <CustomVar name={sanitizedVar} />
      {/each}
    </div>

    {#if $promptStrings}
      <p>
        <strong>{$promptStrings.length}</strong> prompt variations
        {#if !$allCustomVarsAreFilled}
          <strong class="text-red-600">incomplete</strong>
        {/if}
      </p>
      <div class="max-h-32 overflow-auto">
        {#each $promptStrings as promptString, i (i)}
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
