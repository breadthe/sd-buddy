<script lang="ts">
  import { AlertTypes } from "../types";

  const colors = {
    error: "bg-red-100",
    info: "bg-blue-100",
    success: "bg-green-100",
    warning: "bg-yellow-100",
    neutral: "bg-gray-100", // default
  };

  export let alertType: AlertTypes = AlertTypes.Neutral;
</script>

<div class={`w-full p-2 font-mono text-sm shadow max-h-24 overflow-auto ${colors[alertType]}`}>
  <slot />
</div>

<style>
</style>
