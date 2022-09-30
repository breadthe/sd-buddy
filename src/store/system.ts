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
