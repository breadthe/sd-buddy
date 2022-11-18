import { derived, readable, writable } from "svelte/store"
import { txt2ImgParams } from "../utils"
import { prompt, pythonPath } from "./"
import { Rating, type Run } from "../types"

// --ddim_steps (Steps)
const DEFAULT_DDIM_STEPS = 10 // default 50 (keeping it 10 because slow computer)
export const defaultSteps = readable<number>(DEFAULT_DDIM_STEPS)
export const steps = writable<number>(DEFAULT_DDIM_STEPS) // selected steps
export const maxSteps = readable<number>(100)
export const stepsOptions = readable<number[]>([1, 2, 3, 4, 5, 10, 15, 25, 50, 75, 100])
export const useCustomSteps = writable<boolean>(false)

// --scale (CFG Scale)
const DEFAULT_SCALE = 8 // default 7.5 but we round to 8
export const defaultScale = readable<number>(DEFAULT_SCALE)
export const scale = writable<number>(DEFAULT_SCALE) // selected CFG (context free guidance) scale
export const maxScale = readable<number>(20) // 1 is AI almost ignores prompt, 20 is "stick to my prompt"

// --n_iter (Batch Count)
const DEFAULT_ITER = 1 // default 1
export const defaultIter = readable<number>(DEFAULT_ITER)
export const iter = writable<number>(DEFAULT_ITER) // selected iter(ations?)
export const maxIter = readable<number>(10) // no idea what it should be, go with 10 for now

// --n_samples (Batch Size)
const DEFAULT_SAMPLES = 1 // default 1
export const defaultSamples = readable<number>(DEFAULT_SAMPLES)
export const samples = writable<number>(DEFAULT_SAMPLES) // selected samples
export const maxSamples = readable<number>(10) // no idea what it should be, go with 10 for now

// --H (Image Height)
const DEFAULT_HEIGHT = 512 // default 512
export const defaultHeight = readable<number>(DEFAULT_HEIGHT)
export const height = writable<number>(DEFAULT_HEIGHT) // selected height

// --W (Image Width)
const DEFAULT_WIDTH = 512 // default 512
export const defaultWidth = readable<number>(DEFAULT_WIDTH)
export const width = writable<number>(DEFAULT_WIDTH) // selected width

// --seed (Seed)
const DEFAULT_SEED = 42 // default 42, set to -1 for random
export const defaultSeed = readable<number>(DEFAULT_SEED)
export const seed = writable<number>(DEFAULT_SEED) // selected seed
export const maxSeed = readable<number>(4294967295)
export const useRandomSeed = writable<boolean>(false)

export const stableDiffusionCommand = derived([pythonPath, prompt, steps, scale, iter, samples, height, width, seed], ([$pythonPath, $prompt, $steps, $scale, $iter, $samples, $height, $width, $seed]) =>
    stableDiffusionCommandString($pythonPath, $prompt, $steps, $scale, $iter, $samples, $height, $width, $seed)
)

export const stableDiffusionCommandHtml = derived([pythonPath, prompt, steps, scale, iter, samples, height, width, seed], ([$pythonPath, $prompt, $steps, $scale, $iter, $samples, $height, $width, $seed]) =>
    stableDiffusionCommandString($pythonPath, $prompt, $steps, $scale, $iter, $samples, $height, $width, $seed, true)
)

const stableDiffusionCommandString = (pythonPath: string, prompt: string, steps: number, scale: number, iter: number, samples: number, height: number, width: number, seed: number, html: boolean = false): string => {
    const run: Run = {
        prompt: prompt,
        steps: steps,
        scale: scale,
        iter: iter,
        samples: samples,
        height: height,
        width: width,
        seed: seed,
        id: "",
        started_at: undefined,
        rating: Rating.One
    }

    return `${pythonPath} scripts/txt2img.py ${txt2ImgParams(run, html)}`
}
