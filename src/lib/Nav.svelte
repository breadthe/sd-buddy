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

<nav class="sticky top-0 z-10 pb-2 w-full bg-white dark:bg-gray-800">
  <ol class="flex gap-4">
    {#each menu as item (item.name)}
      <li
        class="cursor-pointer border-2 hover:border-blue-600 rounded"
        class:border-blue-600={item.section === $activeSection}
        class:text-white={item.name === $activeSection}
        class:bg-blue-600={item.name === $activeSection}
        class:border-white={item.section !== $activeSection}
        class:hover:text-blue-600={item.name !== $activeSection}
        class:dark:border-gray-800={item.section !== $activeSection}
        class:dark:hover:border-blue-600={item.section !== $activeSection}
        on:click={() => (activeSection.set(item.section))}
      >
        <span class="px-2">{item.name}</span>
      </li>
    {/each}
  </ol>
</nav>

<style>
</style>
