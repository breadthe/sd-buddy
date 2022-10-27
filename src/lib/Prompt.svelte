<script>
  // store imports
  import { prompt, customVars, extractedVars } from "../store"

  const placeholder = "a red juicy apple floating in outer space, like a planet"

  // watch extractedVars, when the values change, update customVars
  $: {
    const cv = []
    $extractedVars.forEach((ev) => {
      const name = ev.slice(1) // "age", after removing $ from "$age"

      // skip if the current "name" key already exists in customVars
      const ix = $customVars.findIndex((cv) => cv.name === name)
      if (ix >= 0) {
        cv.push({ name, values: $customVars[ix].values })
      } else {
        cv.push({ name, values: null })
      }
    })
    customVars.set(cv)
  }
</script>

<textarea rows="5" cols="50" {placeholder} bind:value={$prompt} autocomplete="off" autocorrect="off" />
