import { readable, writable } from "svelte/store";

// --ddim_steps
const DEFAULT_DDIM_STEPS = 10
export const defaultSteps = readable<number>(DEFAULT_DDIM_STEPS) // default 50 (keeping it 10 because slow computer)
export const steps = writable<number>(DEFAULT_DDIM_STEPS) // selected steps
export const maxSteps = readable<number>(100)
export const stepsOptions = readable<number[]>([1, 2, 3, 4, 5, 10, 15, 25, 50, 75, 100])
export const useCustomSteps = writable<boolean>(false)
