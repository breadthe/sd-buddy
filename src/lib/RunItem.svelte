<script lang="ts">
  import { convertFileSrc } from "@tauri-apps/api/tauri";
  import { open } from "@tauri-apps/api/shell";
  import { reusePrompt, stableDiffusionDirectory } from "../store";
  import { createEventDispatcher, onMount, beforeUpdate } from "svelte";
  import type { Run } from "../types";

  export let run: Run;
  export let imageOnly: boolean = false; // display only the image

  const dispatch = createEventDispatcher();

  // Image processing stuff
  $: stableDiffusionOutputDirectory = `${$stableDiffusionDirectory}/outputs/txt2img-samples`;
  let imgSrc: string = ""; // img src base64 string

  // Flags
  let isDeleting = false;

  async function openImage(imageName: string) {
    if (!imageName) return;

    await open(`file://${stableDiffusionOutputDirectory}/${imageName}`);
  }

  // @see https://tauri.app/v1/api/js/modules/tauri/#convertfilesrc
  async function loadTheImage() {
    const filePath = `${stableDiffusionOutputDirectory}/${run.image_name}`;
    const imageUrl = convertFileSrc(filePath);
    imgSrc = imageUrl;
  }

  beforeUpdate(async () => {
    await loadTheImage();
  });

  onMount(async () => {
    await loadTheImage();
  });
</script>

<div
  class={`relative ${imageOnly ? "w-full" : "max-w-[196px] border border-blue-500/50" } flex flex-col divide-y divide-blue-600/50 hover:border-blue-500 rounded`}
>
  {#if !isDeleting}
    {#if run.image_name && imgSrc}
      <img
        src={imgSrc}
        alt={run.image_name}
        class="cursor-pointer"
        on:click|preventDefault={() => openImage(run.image_name)}
      />
    {:else}
        <div class="w-full text-center text-red-600" class:text-xs={!imageOnly}>image error</div>
    {/if}

    {#if !imageOnly}
      <dl
        class="p-2 text-xs hover:bg-blue-100 hover:dark:bg-blue-800 cursor-pointer"
        title="Click to re-use this prompt & parameters"
        on:click={() => reusePrompt.set(run)}
      >
        <dt class="font-bold">prompt</dt>
        <dd>{run.prompt}</dd>
      </dl>

      <dl class="p-2 grid grid-cols-2 text-xs">
        <dt class="font-bold">image</dt>
        <dd>
          {#if run.image_name}
            <a
              href="#"
              on:click|preventDefault={() => openImage(run.image_name)}
              >{run.image_name}</a
            >
          {:else}
            <span class="text-red-600">error</span>
          {/if}
        </dd>
        <!-- <dt class="font-bold">id</dt><dd>{run.id}</dd> -->
        {#if run.height && run.width}
          <dt class="font-bold">size</dt>
          <dd>{run.height}x{run.width}</dd>
        {/if}
        <dt class="font-bold">steps</dt>
        <dd>{run.steps}</dd>
        {#if run.samples}
          <dt class="font-bold">samples</dt>
          <dd>{run.samples}</dd>
        {/if}
        {#if run.scale}
          <dt class="font-bold">scale</dt>
          <dd>{run.scale}</dd>
        {/if}
        {#if run.seed}
          <dt class="font-bold">seed</dt>
          <dd>{run.seed}</dd>
        {/if}
        <dt class="font-bold">elapsed</dt>
        <dd>{run.elapsed / 1000}s</dd>
        <!-- {#if run.rating}
        <dt class="font-bold">rating</dt>
        <dd>{run.rating}/5</dd>
      {/if} -->
      </dl>

      <button
        class="absolute bottom-0 right-0 py-0 px-1 leading-none rounded-none rounded-br rounded-tl"
        title="Delete run"
        on:click={() => (isDeleting = true)}>&times;</button
      >
    {/if}
  {:else}
    <div class="flex flex-col items-center justify-center h-full gap-2 p-2">
      <p class="text-xs text-center font-bold">
        Are you sure you want to delete this run?
      </p>
      <p class="text-xs text-center">
        The image will NOT be deleted from disk.
      </p>
      <div class="flex gap-2">
        <button
          class="link text-xs text-blue-600"
          on:click={() => (isDeleting = false)}
        >
          Cancel
        </button>
        <button
          class="link text-xs text-red-600"
          on:click={() => {
            dispatch("deleteRun", run);
            isDeleting = false;
          }}
        >
          Delete
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
</style>
