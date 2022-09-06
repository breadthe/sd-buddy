<script lang="ts">
  import { readBinaryFile } from "@tauri-apps/api/fs";
  import { open } from "@tauri-apps/api/shell";
  import { reusePrompt, stableDiffusionDirectory } from "../store";
  import { createEventDispatcher, onMount, beforeUpdate } from "svelte";
  import type { Run } from "../types";

  export let run: Run;

  const dispatch = createEventDispatcher();

  // Image processing stuff
  $: stableDiffusionOutputDirectory = `${$stableDiffusionDirectory}/outputs/txt2img-samples`;
  let imgContents: string = ""; // base64 encoded image contents
  let imgSrc: string = ""; // img src base64 string
  $: {
    if (imgContents) {
      imgSrc = `data:image/png;base64,${imgContents}`;
    }
  }

  // Flags
  let isDeleting = false;

  async function readTheImageFile() {
    let imgPath: string = ""; // absolute path of the image on disk (SD output directory)

    if (!run.image_name) return;

    if (run.image_name.match(/.png/gi)) {
      imgPath = `${stableDiffusionOutputDirectory}/${run.image_name}`;
    }

    imgPath = imgPath; // needs this to be reassigned for... reasons

    await readBinaryFile(imgPath)
      .then((contents) => {
        // convert from Uint8Array to base64
        imgContents = btoa(
          new Uint8Array(contents).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }

  async function openImage(imageName: string) {
    if (!imageName) return;

    await open(`file://${stableDiffusionOutputDirectory}/${imageName}`);
  }

  beforeUpdate(async () => {
    await readTheImageFile();
  });

  onMount(async () => {
    await readTheImageFile();
  });
</script>

<div
  class="relative max-w-[200px] flex flex-col divide-y divide-blue-600/50 border border-blue-500/50 hover:border-blue-500 rounded"
>
  {#if !isDeleting}
    {#if run.image_name && imgSrc}
      <img
        src={imgSrc}
        alt={run.image_name}
        class="cursor-pointer"
        on:click|preventDefault={() => openImage(run.image_name)}
      />
    {/if}
    <dl
      class="p-2 text-xs hover:bg-blue-100 cursor-pointer"
      title="Click to re-use this prompt"
      on:click={() => reusePrompt.set(run.prompt)}
    >
      <dt class="font-bold">prompt</dt>
      <dd>{run.prompt}</dd>
    </dl>

    <dl class="p-2 grid grid-cols-2 text-xs">
      <dt class="font-bold">image</dt>
      <dd>
        {#if run.image_name}
          <a href="#" on:click|preventDefault={() => openImage(run.image_name)}
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
      class="absolute bottom-0 right-0 py-0 px-0 leading-none rounded-none rounded-br rounded-tl"
      title="Delete run"
      on:click={() => (isDeleting = true)}>&times;</button
    >
  {:else}
    <div class="flex flex-col items-center gap-2 p-2">
      <p class="text-xs text-center">
        Are you sure you want to delete this run?
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
