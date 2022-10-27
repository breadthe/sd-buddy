<script lang="ts">
  // system/lib/util imports
  import { setTheme, setIsDark } from "../utils"

  // store imports
  import { theme } from "../store"

  function handleTheme(_element: HTMLTemplateElement) {
    const initialTheme = $theme
    setTheme(initialTheme)

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", listenToThemeChange)

    return {
      destroy() {
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .removeEventListener("change", listenToThemeChange)
      },
    }
  }

  function listenToThemeChange(event: { matches: boolean }) {
    if ($theme !== "automatic") return

    setIsDark(event.matches)
  }
</script>

<svelte:window use:handleTheme />
