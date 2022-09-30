import { writable } from "svelte/store";

// Indicator for when the user is copying to clipboard
export const copying = writable(false);
