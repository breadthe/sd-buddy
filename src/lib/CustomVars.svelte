<script>
  import { extractedVars } from "../store"
  import CustomVar from "./CustomVar.svelte"
</script>

{#each $extractedVars as extractedVar}
  {@const sanitizedVar = extractedVar.toString().replace("$", "")}
  <div>
    <CustomVar name={sanitizedVar} />
  </div>
{/each}
