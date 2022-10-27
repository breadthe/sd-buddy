<script lang="ts">
  // store imports
  import { activeSection } from "../store"

  const menu = [
    {
      name: "Txt2Img",
      icon: "plus",
      section: "Txt2Img",
    },
    /* {
      name: "Img2Img",
      icon: "list",
      section: "Img2Img",
    }, */
    {
      name: "Gallery",
      icon: "list",
      section: "Gallery",
    },
    {
      name: "Settings",
      icon: "list",
      section: "Settings",
    },
  ]
</script>

<nav class="sticky top-0 z-10 pb-2 w-full bg-white dark:bg-neutral-800">
  <ol class="flex gap-4">
    {#each menu as item (item.name)}
      <li
        class="border-blue-600 cursor-pointer hover:text-blue-600"
        class:border-b-4={item.name === $activeSection}
        class:text-blue-600={item.name === $activeSection}
        class:font-bold={item.name === $activeSection}
        class:rounded={item.name !== $activeSection}
        on:click={() => (activeSection.set(item.section))}
      >
        <span class="px-2">{item.name}</span>
      </li>
    {/each}
  </ol>
</nav>

<style>
</style>
