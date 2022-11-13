import { copying } from "./store"
import type { Run } from "./types"

export async function copyToClipboard(text: string) {
    if (!navigator.clipboard) return

    try {
        copying.set(true)
        await navigator.clipboard.writeText(text)

        setTimeout(() => {
            copying.set(false)
        }, 2000)
    } catch (error) {
        copying.set(false)
        console.error("failed copying to clipboard", error)
    }
}


// Theming functions
export function setIsDark(dark: boolean) {
    const htmlNode = document.querySelector("html")
    dark ? htmlNode?.classList.add("dark") : htmlNode?.classList.remove("dark")
}

export function isDark() {
    return document.querySelector("html")?.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function setTheme(theme: string) {
    if (theme === "light") {
        return setIsDark(false)
    }

    if (theme === "dark") {
        return setIsDark(true)
    }

    if (theme === "automatic" || theme === undefined) {
        return setIsDark(
            window.matchMedia("(prefers-color-scheme: dark)").matches
        )
    }
}


// Stable Diffusion functions

// generate a random seed between 0 and maxSeed
export const getRandomSeed = (maxSeed: number) => Math.floor(Math.random() * maxSeed)

/**
 * Returns a concatenated string of the command line arguments for txt2img
 * Pass html = true to return an HTML string of the same
 */
export function txt2ImgParams(run: Run, html: boolean = false) {
    return [
        `--plms`,
        `--prompt ${html ? `<strong>` : ``}"${run.prompt}"${html ? `</strong>` : ``}`,
        `--n_samples ${html ? `<strong>` : ``}${run?.samples.toString()}${html ? `</strong>` : ``}`,
        `--scale ${html ? `<strong>` : ``}${run?.scale.toString()}${html ? `</strong>` : ``}`,
        `--n_iter ${html ? `<strong>` : ``}${run?.iter.toString()}${html ? `</strong>` : ``}`,
        `--ddim_steps ${html ? `<strong>` : ``}${run?.steps.toString()}${html ? `</strong>` : ``}`,
        `--H ${html ? `<strong>` : ``}${run.height}${html ? `</strong>` : ``}`,
        `--W ${html ? `<strong>` : ``}${run.width}${html ? `</strong>` : ``}`,
        `--seed ${html ? `<strong>` : ``}${run?.seed.toString()}${html ? `</strong>` : ``}`,
        `--fixed_code`,
    ].join(" ")
}
