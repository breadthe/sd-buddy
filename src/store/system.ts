import { writable } from "svelte/store";

// Indicator for when the user is copying to clipboard
export const copying = writable(false);

// The current section of the app, defaults to the "Generate" section
export const currentSection = writable("Generate");
