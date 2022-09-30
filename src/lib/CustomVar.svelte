<script type="ts">
  import type { CustomVar } from "../types"
  import { prompt, extractedVars, customVars, promptStrings } from "../store"

  export let name = ""

  let value: string
  let varObj: CustomVar = {
      name: "",
      values: []
  }

  function handleCustomVar(e) {
    // split it by comma, trim spaces, filter empty values
    const params = e.target.value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v)

    varObj = { name, values: params } // {"name": "age", "values":["20","30"]}

    if (params.length) {
      customVars.push(varObj)
    } else {
      customVars.remove(varObj)
      value = null
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
    on:input={handleCustomVar}
  />
</label>
