import { writable } from "svelte/store"

// Indicator for when the user is copying to clipboard
export const copying = writable(false)

// The currently active section of the app, defaults to the "Txt2Img" section
const storedActiveSection = JSON.parse(localStorage.getItem("activeSection")) || "Txt2Img"
export const activeSection = writable(storedActiveSection ? storedActiveSection : "Txt2Img")
activeSection.subscribe(value => {
    localStorage.setItem("activeSection", JSON.stringify(value));
})

// Theme: dark, light, automatic
const storedTheme = localStorage.getItem("theme") || "light"
export const theme = writable(storedTheme ? storedTheme : "light")
theme.subscribe((value: string) => {
    localStorage.setItem("theme", value);
})

// Thumbnail size
const defaultThumbnailSize: number = 196
const maxThumbnailSize: number = 512
const stepSize: number = (maxThumbnailSize - defaultThumbnailSize) / 4
function createThumbnailSizeStore() {
    let storedThumbnailSize: number = JSON.parse(localStorage.getItem("thumbnailSize")) || defaultThumbnailSize;
    const { subscribe, set } = writable(storedThumbnailSize);

    return {
        subscribe,
        set: (value: number) => {
            localStorage.setItem("thumbnailSize", JSON.stringify(value))
        },
        increase: () => {
            let newThumbnailSize: number = storedThumbnailSize

            // increment value by step size
            newThumbnailSize += stepSize
            if (newThumbnailSize > maxThumbnailSize) newThumbnailSize = maxThumbnailSize

            storedThumbnailSize = newThumbnailSize;
            localStorage.setItem("thumbnailSize", JSON.stringify(storedThumbnailSize))
            set(storedThumbnailSize)
        },
        decrease: () => {
            let newThumbnailSize: number = storedThumbnailSize

            // decrement value by step size
            newThumbnailSize -= stepSize
            if (newThumbnailSize < defaultThumbnailSize) newThumbnailSize = defaultThumbnailSize

            storedThumbnailSize = newThumbnailSize;
            localStorage.setItem("thumbnailSize", JSON.stringify(storedThumbnailSize))
            set(storedThumbnailSize)
        },
    };
}

export const thumbnailSize = createThumbnailSizeStore()
