import { readable, writable } from "svelte/store";

// --ddim_steps
const DEFAULT_DDIM_STEPS = 10
export const defaultSteps = readable<number>(DEFAULT_DDIM_STEPS) // default 50 (keeping it 10 because slow computer)
export const steps = writable<number>(DEFAULT_DDIM_STEPS) // selected steps
export const maxSteps = readable<number>(100)
export const stepsOptions = readable<number[]>([1, 2, 3, 4, 5, 10, 15, 25, 50, 75, 100])
export const useCustomSteps = writable<boolean>(false)

// --scale
const DEFAULT_SCALE = 8
export const defaultScale = readable<number>(DEFAULT_SCALE) // default 7.5 but we round to 8
export const scale = writable<number>(DEFAULT_SCALE) // selected CFG (context free guidance) scale
export const maxScale = readable<number>(20) // 1 is AI almost ignores prompt, 20 is "stick to my prompt"

// --n_iter (Batch Count)
const DEFAULT_ITER = 1
export const defaultIter = readable<number>(DEFAULT_ITER) // default 1
export const iter = writable<number>(DEFAULT_ITER) // selected iter(ations?)
export const maxIter = readable<number>(10) // no idea what it should be, go with 10 for now
