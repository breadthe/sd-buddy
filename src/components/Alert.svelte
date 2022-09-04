<script lang="ts">
  const colors = {
    error: "bg-red-100",
    info: "bg-blue-100",
    success: "bg-green-100",
    warning: "bg-yellow-100",
    neutral: "bg-gray-100", // default
  };

  export let type: string = "neutral";
</script>

<div class={`p-2 font-mono text-sm shadow ${colors[type]}`}>
  <slot />
</div>

<style>
</style>
