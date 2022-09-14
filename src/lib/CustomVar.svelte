<script type="ts">
  import type { CustomVar } from "../types"
  import { customVars, extractedVars, promptStrings } from "../store"

  export let name = ""

  let value: string
  let varObj: CustomVar = {
    name: "",
    values: [],
  }

  // parse the input string
  function parseString(e) {
    // split it by comma, trim spaces, filter empty values
    const params = e.target.value
      .split(",")
      .map((v: string) => v.trim())
      .filter((v: any) => v)

    varObj = { name, values: params } // {"name": "age", "values":["young","old"]}

    if (params.length) {
        customVars.push(varObj)
    } else {
        customVars.remove(varObj)
    }

    if (!$customVars.length) {
      promptStrings.set([])
    }
  }
</script>

<label>
  <span class="w-1/4 font-bold">{name}</span>
  <input
    {name}
    placeholder="comma,separated,values"
    autocomplete="off"
    autocorrect="off"
    class="w-full"
    bind:value
    on:input={parseString}
  />
</label>
