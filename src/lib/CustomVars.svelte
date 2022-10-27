<script>
  // store imports
  import { extractedVars } from "../store"

  // component imports
  import CustomVar from "./CustomVar.svelte"
</script>

{#each $extractedVars as extractedVar (extractedVar)}
  {@const sanitizedVar = extractedVar.toString().replace("$", "")}
  <div>
    <CustomVar name={sanitizedVar} />
  </div>
{/each}
